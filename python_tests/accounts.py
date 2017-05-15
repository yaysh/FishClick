import requests

url = "http://localhost:80/api/accounts"
user_id = "5919a5e0497ffe15bbc9b1a3"

def main():
    # print("Testing create account")
    # deleteAccount()
    # createAccount()                   #fungerar
    # login()                           #fungerar
    # addFollower()                     #fungerar
    # removeFollower()                  #fungerar
    # getFollowers()                    #fungerar
    # deleteAccountUnfollowTest()
    # caughtFishPost()
    # caughtFishGet()
    # getAllFishFromUser()
    removeFishFromUser()


def createAccount():
    newAccount = {'username': 'jens', 'password': 'madsen'}
    r = requests.post(url, newAccount)
    print(r.json())


def login():
    loginCredentials = {'username': 'jens', 'password': 'madsen'}
    r = requests.post(
        "http://localhost:80/api/accounts/login", loginCredentials)
    print(r.json())


def deleteAccount():
    while True:
        userInput = input("What id do you want to delete: ")
        if userInput == "n":
            return
        r = requests.delete(url + '/admin/' + userInput)


def addFollower():
    userInput = input("Who do you want to follow? ")
    data = {"user_id": "5913162de3748d327089b288", "want_to_follow": userInput}
    r = requests.post("http://localhost:80/api/accounts/followers", data)
    print(r.json())


def removeFollower():
    userInput = input("Who do you want to unfollow? ")
    data = {"user_id": "5913162de3748d327089b288",
        "want_to_unfollow": userInput}
    r = requests.post("http://localhost:80/api/accounts/unfollow", data)
    result = r.json()
    print(result)


def getFollowers():
    data = {"user_id", user_id}
    r = requests.get("http://localhost:80/api/accounts/followers", data)
    print(r)
    print(r.json())


def deleteAccountUnfollowTest():
    newAccount = {'username': 'anna3', 'password': 'isfeldt'}
    r = requests.post(url+"/admin", newAccount)
    print(r.json())
    data = {"user_id": "5913162de3748d327089b288", "want_to_follow": "anna3"}
    r = requests.post("http://localhost:80/api/accounts/followers", data)
    deleteAccount()


def caughtFishPost():
    data = {
        "user_id" : user_id,
        "latitude": "58.429145",
        "longitude": "15.5824995"    
    }
    r = requests.post(url + "/caughtfish", data)
    print(r.json())

def caughtFishGet():
    data = {"user_id": user_id}
    r = requests.get(url + "/caughtfish", data)
    print(r.json())

def getAllFishFromUser():
    data = {"user_id", user_id}
    r = requests.get(url + "/getuserscaughtfish", data)
    print(r.json())

def removeFishFromUser():
    data = {
        "user_id": user_id,
        "date": "2017/5/15/20/39/328"    
    }
    r = requests.post(url + "/removeuserscaughtfish", data)
    print(r.json())    

main()

