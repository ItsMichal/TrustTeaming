# syntax=docker/dockerfile:1

FROM nikolaik/python-nodejs:python3.10-nodejs18

WORKDIR /app

COPY requirements.txt requirements.txt
RUN pip3 install -r requirements.txt
COPY . .
RUN npm run build



EXPOSE 8080:8080

CMD ["npm", "run", "start"]