FROM python:3.11-alpine

RUN pip install pipenv

WORKDIR /app

ADD listener/Pipfile /app/Pipfile
ADD listener/Pipfile.lock /app/Pipfile.lock

RUN pipenv sync --dev

CMD [ "pipenv", "run", "watchmedo", "auto-restart", "--debug-force-polling", "-d", "src", "-R", "--", "python", "-u", "src/main.py" ]
