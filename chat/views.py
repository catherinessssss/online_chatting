from .utils.zulip import ZulipClient
from django.shortcuts import render


config_file='./.zuliprc'
client = ZulipClient(config_file=config_file)


def index(request):

    # try:
        is_student = request.GET.get('is_student', 'false')
        staff_netid = request.GET.get('staff_netid', '10')
        student_netid = request.GET.get('student_netid', '21')
        student_email = student_netid + '@zulip.com'
        staff_email = staff_netid + '@zulip.com'

        users = client.get_users()
        if is_student == 'true':
            student = next((user for user in users['members'] if user['email'] == student_email), None)
            if student is None:
                client.create_user(student_email, student_netid)
            key = client.fetch_user_api_key(student_email, student_email)
            page_info = {
                'key': key,
                'is_student': is_student,
                'student_email': student_email,
                'student_netid': student_netid,
                # 'staff_email': staff_email,
                # 'staff_netid': staff_netid,
            }
        else:
            # TODO no need to create staff user every time
            staff = next((user for user in users['members'] if user['email'] == staff_email), None)
            if staff is None:
                client.create_user(staff_email, staff_netid)
            stream_name = client.create_stream(user_ids=[student_email, staff_email])
            print("stream_name", stream_name)
            key = client.fetch_user_api_key(staff_email, staff_email)

            page_info = {
                'key': key,
                'is_student': is_student,
                'staff_email': staff_email,
                'staff_netid': staff_netid,
                'stream_name': stream_name,
                'student_email': student_email,
                'student_netid': student_netid,
            }

        
        return render(request, 'chat/index.html', page_info)
    # except Exception e:
    #     print(e)



def create_chatroom(request):
    is_student = request.GET.get('is_student')
    staff_id = request.GET.get('staff_id')
    student_id = request.GET.get('student_id')

    print('is_student', is_student)
    print('staff_id', staff_id)
    print('student_id', student_id)

    return render(request, 'chat/chatroom.html')


def chatroom(request):
    print(dir(request))
    
    return render(request, 'chat/chatroom.html')