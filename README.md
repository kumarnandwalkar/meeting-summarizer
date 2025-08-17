Meeting summarizer made for MangoDesk
using gorq ai and node express and vite 
NOTE:- Secrets are also uploaded i.e .env but those will expire shortly

first remove any existing stopped containers using - docker rm meeting-summarizer
then
command for running docker app - docker run -d --name meeting-summarizer -p 5173:5173 -p 9090:8080 meeting-summarizer

also integrated jenkins CICD pipeline so that whenever any code is pushed on this repo it will pull the changes and will build the container
again and will run it
