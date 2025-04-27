#!/usr/bin/env bash
set -e

API="http://localhost:3000/api"
CK="cookies.txt"

echo
echo "=== 1) REGISTER (Auth) ==="
curl -i -X POST $API/auth/register \
  -H "Content-Type: application/json" \
  -d '{"name":"Ana","email":"ana@ej.com","password":"Pass1234"}'
echo; echo

echo "=== 2) LOGIN (guarda cookie) ==="
curl -i -c $CK -X POST $API/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"ana@ej.com","password":"Pass1234"}'
echo; echo

echo "=== 3) CREATE CAREER ==="
curl -s -b $CK -X POST $API/careers \
  -H "Content-Type: application/json" \
  -d '{"name":"Ing. Telemática","schoolName":"Fac. Ingeniería"}' | jq .
echo; echo

echo "=== 4) LIST CAREERS ==="
curl -s -b $CK $API/careers | jq .
echo; echo

echo "=== 5) CREATE CATEGORY ==="
curl -s -b $CK -X POST $API/categories \
  -H "Content-Type: application/json" \
  -d '{"name":"Programación","description":"Tutoriales y guías"}' | jq .
echo; echo

echo "=== 6) LIST CATEGORIES ==="
curl -s -b $CK $API/categories | jq .
echo; echo

echo "=== 7) CREATE RESOURCE ==="
curl -s -b $CK -X POST $API/resources \
  -H "Content-Type: application/json" \
  -d '{
    "title":"Express Básico",
    "description":"Guía rápida de ExpressJS",
    "datePublication":"2025-04-26",
    "isActive":true,
    "idCategory":2,
    "idCareer":2,
    "idDirector":2,
    "idRevisor1":2,
    "idRevisor2":2
  }' | jq .
echo; echo

echo "=== 8) LIST RESOURCES ==="
curl -s -b $CK $API/resources | jq .
echo; echo

echo "=== 9) ASSIGN RESOURCE TO USER (ResourceUser) ==="
curl -s -b $CK -X POST $API/resource-user \
  -H "Content-Type: application/json" \
  -d '{"idUser":2,"idResource":3}' | jq .
echo; echo

echo "=== 10) GET RESOURCES BY USER (2) ==="
curl -s -b $CK $API/resource-user/user/2 | jq .
echo; echo

echo "=== 11) GET USERS BY RESOURCE (1) ==="
curl -s -b $CK $API/resource-user/resource/3 | jq .
echo; echo

echo "=== 12) DELETE RESOURCE-USER (2,1) ==="
curl -i -b $CK -X DELETE $API/resource-user/2/3
echo; echo

echo "=== 13) LOGOUT ==="
curl -i -b $CK -X POST $API/auth/logout
echo; echo