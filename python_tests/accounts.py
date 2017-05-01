import requests

url = "http://localhost:80/api/accounts"

def main():  
    # print("Testing create account")
    # createAccount()
    # deleteAccount()
    # print("Testing login")
    # login()
    # addFollower()
    # removeFollower()
    # getFollowers()



def createAccount():
    newAccount = {'username':'jens', 'password': 'madsen'}
    r = requests.post(url, newAccount)
    print(r.json())



def login():
    loginCredentials = {'username':'jens', 'password': 'madsen'}
    r = requests.post(url, loginCredentials)
    print(r.json())



def deleteAccount():
    while True:
        userInput = input("What id do you want to delete: ")
        if userInput == "n":
            return
        r = requests.delete(url + '/' + userInput)




def addFollower():
    userInput = input("Who do you want to follow? ")
    data = {"username": "jens", "username": userInput}
    r = requests.post("http://localhost:80/api/accounts/addfollower", data)
    print(r.json())



def removeFollower():
    userInput = input("Who do you want to unfollow? ")
    data = {"username": "jens", "username": userInput}
    r = requests.post("http://localhost:80/api/accounts/removefollower", data)
    result = r.json()
    if result['result']['nModified'] == 0:
        print("0 modified")
    elif result['result']['nModified'] == 1:
        print("1 modified")
    else:
        print("error?")



def getFollowers():
    data = {"username": "jens"}
    # r = requests.post(url + "/getfollowers", data)
    r = requests.post("http://localhost:80/api/accounts/getfollowers", data)
    print(r.json())


main()