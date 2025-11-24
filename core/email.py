from fastapi_mail import ConnectionConfig
import os

conf = ConnectionConfig(
    MAIL_USERNAME = os.environ.get("MAIL_USERNAME", "advmca1001@gmail.com"),
    MAIL_PASSWORD = os.environ.get("MAIL_PASSWORD", "bjqt bqcw boad atri"),
    MAIL_FROM = os.environ.get("MAIL_FROM", "advmca1001@gmail.com"),
    MAIL_PORT = 587,
    MAIL_SERVER = "smtp.gmail.com",
    MAIL_STARTTLS = True,
    MAIL_SSL_TLS = False,
    USE_CREDENTIALS = True,
    VALIDATE_CERTS = True
)