(async () => {
  if (isCounsellorPage) {
    const zulip = require("zulip-js");

    const pollyImg = document.getElementById("polly-img").value;
    const clientImg = document.getElementById("client-img").value;
    const supervisorImg = document.getElementById("supervisor-img").value;

    // Listen 'Enter' key press
    $(document).on("keyup", "#message-text", (event) => {
      if (event.keyCode === 13) {
        event.preventDefault();
        event.target.blur();
        document.getElementById("send-message-btn").click();
      }
    });

    let index; // botui message id

    const renderCounsellorMessage = async (event) => {
      switch (event.type) {
        case "typing":
          if (event.sender.email !== staffEmail) {
            if (event.op === "start") {
              index = await botui.message.add({
                loading: true,
                human: false,
                photo: clientImg,
              });
            } else {
              await botui.message.remove(index, {
                loading: false,
                human: false,
                photo: clientImg,
              });
            }
          }
          break;
        case "message":
          if (event.message.sender_email !== staffEmail) {
            if (event.message.type === "stream") {
              const photo =
                event.message.sender_email === studentEmail
                  ? clientImg
                  : supervisorImg;
              await botui.message.add({
                loading: false,
                human: false,
                photo: photo,
                content: event.message.content,
              });
            }
          }
          break;
        case "subscription":
          // remove student
          if (
            event.op == "peer_remove" &&
            !event.subscriptions.includes(studentEmail)
          ) {
            studentEmail = "";
          }
          break;
      }
    };

    const config = {
      username: staffEmail,
      apiKey: apiKey,
      realm: "https://zulip.cat",
    };
    const client = await zulip(config);

    const handleEvent = async (event) => {
      console.log("Got Event:", event);
      renderCounsellorMessage(event);
    };

    // send message
    $(document)
      .on("click", "#send-message-btn", async () => {
        const text = document.getElementById("message-text");

        if (!text.value) {
          text.focus();
          return;
        }

        botui.message.human({
          photo: pollyImg,
          content: text.value,
        });

        const params = {
          to: streamName,
          type: "stream",
          topic: "chat",
          content: text.value,
        };
        await client.messages.send(params);

        text.value = "";
      })
      .on("click", "#counsellor-leave-chatroom-btn", async () => {
        const result = confirm(
          "Are you sure you want to end the conversation?"
        );
        if (result == true) {
          const response = await $.ajax({
            url: "/chat/unsubscribe_stream",
            method: "POST",
            dataType: "json",
            data: JSON.stringify({
              unsubscribers_netid: [studentNetid],
              staff_netid: staffNetid,
            }),
          });

          if (response.status == "success") {
            const response = await $.ajax({
              url: "/chat/delete_stream_in_topic",
              method: "POST",
              dataType: "json",
              data: JSON.stringify({
                staff_netid: staffNetid,
              }),
            });

            if (response.status == "success") {
              console.log("Successfully delete the history");
            }

            alert("You have successfully end the conversation.");
          } else {
            alert("Ops, Something wrong happened.");
          }
        }
      })
      .on("focus", "#message-text", async () => {
        if (!studentEmail) {
          return;
        }

        await client.typing.send({
          to: [studentEmail],
          op: "start",
        });
      })
      .on("blur", "#message-text", async () => {
        if (!studentEmail) {
          return;
        }

        await client.typing.send({
          to: [studentEmail],
          op: "stop",
        });
      });

    try {
      await client.callOnEachEvent(handleEvent, ["streams"]);
    } catch (error) {
      console.log("error", error.message);
    }
  }
})();
