import requests

url = "http://localhost:80/api/accounts"

def main():  
    # print("Testing create account")
    # deleteAccount()
    # createAccount()                   #fungerar
    # login()                           #fungerar
     addFollower()
    # removeFollower()                  #fungerar
    # getFollowers()                    #fungerar



def createAccount():
    newAccount = {'username':'anna2', 'password': 'isfeldt'}
    r = requests.post(url, newAccount)
    print(r.json())



def login():
    loginCredentials = {'username':'jens', 'password': 'madsen'}
    r = requests.post("http://localhost:80/api/accounts/login", loginCredentials)
    print(r.json())



def deleteAccount():
    while True:
        userInput = input("What id do you want to delete: ")
        if userInput == "n":
            return
        r = requests.delete(url + '/' + userInput)




def addFollower():
    userInput = input("Who do you want to follow? ")
    data = {"user_id": "59071e74f30f8f0b83ce88c6", "want_to_follow": userInput}
    r = requests.post("http://localhost:80/api/accounts/followers", data)
    print(r.json())



def removeFollower():
    userInput = input("Who do you want to unfollow? ")
    data = {"user_id": "59071e74f30f8f0b83ce88c6", "want_to_unfollow": userInput}
    r = requests.post("http://localhost:80/api/accounts/unfollow", data)
    result = r.json()
    print(result)


def getFollowers():
    data = {"user_id": "59071e74f30f8f0b83ce88c6"}
    r = requests.get("http://localhost:80/api/accounts/followers", data)
    print(r.json())


main()