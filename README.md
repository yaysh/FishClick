# FishClick
Backend for my mobile app

/api/accounts/
POST - skapar nytt account 
data = {username: "", password: ""}
GET - hämtar alla accounts (används för att testa under utveckling, tas bort senare)

/api/accounts/followers/
POST - lägger till en följare i användares “following”-lista.
data = {user_id: "", "want_to_follow: ""}
GET - hämtar alla användare som en användare följer.
data = {username: ""}

/api/accounts/unfollow/
POST - ta bort en följare i användarens "following"-lista.
data = {user_id, "", want_to_unfollow: ""}

/api/accounts/:id/
GET - hämtar alla uppgifter om användaren. 
DELETE - raderar en användare 
POST - uppdaterar informationen om en användare

/api/accounts/login
POST - loggar in en anvädare
data = {username: "", password: ""}
