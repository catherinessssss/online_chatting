# online-chatting
Django framework integrate with Zulip's API




## Usage

| Role | Url | Documentation |
| --- | --- | --- |
| Student | GET `?is_student=true&student_netid=test_student` | Student chatting flow. `student_netid` is required. `is_student` defaults to false. |
| Counsellor | GET `?student_netid=test_student&staff_netid=test_staff` | Counsellor chatting flow.  Both `student_netid` and `staff_netid` are required.|





#### TODO

* Supervisor 
    * /join
    * /send_message
* Leave chatting room
    * delete stream
    * deactivate student (TBC)









