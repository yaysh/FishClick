# FishClick
Backend for my mobile app

Vad som fungerar just nu:

/api/accounts/
POST request skapar new account
data = {'username': username, 'password': password}

GET request hämtar alla accounts just nu
Ingen data behöver skickas
error resulterar {'error': err}

/*
  DESSA TRE BORDE KANSKE VARA GET, POST, DELETE PÅ /api/accounts/followers
*/
/api/accounts/addfollower
POST request lägger till en följare
data = req.body.username //KANSKE ÄNDRA TILL PARAMS ISTÄLLET FÖR BODY?

/api/accounts/removefollower
POST tar bort en följare
data = req.body.username //KANSKE ÄNDRA TILL PARAMS ISTÄLLET FÖR BODY?
error resulterar i {'error': err}
en lyckat transaktion resulterar i {'result': result}

/api/accounts/getfollowers
GET hämtar alla följare som en användare har
data = req.body = {'username': username}
Inga användare hittades resulterar i {"error": "user is not following anyone"}
Error resulterar i {"error": err}
/*
  DESSA TRE BORDE KANSKE VARA GET, POST, DELETE PÅ /api/accounts/followers
*/

/api/accounts/:id/
GET hämtar användare vars id är req.params.id
error resulterar i {'error': err}

DELETE resulterar i att req.params.id raderas om det finns i databasen
