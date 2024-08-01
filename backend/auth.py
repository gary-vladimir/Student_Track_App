import json
from flask import request, current_app, g
from functools import wraps
from jose import jwt
from urllib.request import urlopen
from dotenv import load_dotenv
import os

load_dotenv()

AUTH0_DOMAIN = os.getenv("AUTH0_DOMAIN")
API_AUDIENCE = os.getenv("API_AUDIENCE")
ALGORITHMS = os.getenv("ALGORITHMS")


class AuthError(Exception):
    def __init__(self, error, status_code):
        self.error = error
        self.status_code = status_code


def get_token_auth_header():
    auth = request.headers.get("Authorization", None)
    # print("Authorization Header:", auth)
    if not auth:
        raise AuthError(
            {
                "error": "authorization_header_missing",
                "description": "Authorization header is expected",
            },
            401,
        )
    parts = auth.split()
    if len(parts) > 2:
        raise AuthError(
            {
                "error": "invalid_header",
                "description": "Authorization header must be Bearer token",
            },
            401,
        )
    elif len(parts) == 1:
        raise AuthError(
            {"error": "invalid_header", "description": "Token not found"}, 401
        )
    elif parts[0].lower() != "bearer":
        raise AuthError(
            {
                "error": "invalid_header",
                "description": "Authorization header must start with Bearer",
            },
            401,
        )
    return parts[1]


def check_permissions(permission, payload):
    if "permissions" not in payload:
        raise AuthError(
            {
                "error": "invalid_claims",
                "description": "Permissions are not included in JWT",
            },
            400,
        )
    if permission not in payload["permissions"]:
        raise AuthError(
            {"error": "forbidden", "description": "Permission not found"}, 403
        )
    return True


def verify_decode_jwt(token):
    # Obtain the JWKS
    jsonurl = urlopen(f"https://{AUTH0_DOMAIN}/.well-known/jwks.json")
    try:
        jwks = json.loads(jsonurl.read())
        # print("JWKS:", jwks)
    except Exception as e:
        print("Error fetching JWKS:", e)
        raise AuthError(
            {"code": "invalid_jwk", "description": "Unable to fetch JWKS"}, 500
        )

    # Get the header from the token
    unverified_header = jwt.get_unverified_header(token)

    rsa_key = {}

    if "kid" not in unverified_header:
        raise AuthError(
            {"code": "invalid_header", "description": "Authorization malformed."}, 401
        )

    for key in jwks["keys"]:
        if key["kid"] == unverified_header["kid"]:
            rsa_key = {
                "kty": key["kty"],
                "kid": key["kid"],
                "use": key["use"],
                "n": key["n"],
                "e": key["e"],
            }
    if rsa_key:
        try:
            payload = jwt.decode(
                token,
                rsa_key,
                algorithms=ALGORITHMS,
                audience=API_AUDIENCE,
                issuer=f"https://{AUTH0_DOMAIN}/",
            )
            return payload
        except jwt.ExpiredSignatureError:
            raise AuthError(
                {"code": "token_expired", "description": "token is expired"}, 401
            )
        except jwt.JWTClaimsError:
            raise AuthError(
                {
                    "code": "invalid_claims",
                    "description": "incorrect claims, please check the audience and issuer",
                },
                401,
            )
        except Exception as e:
            raise AuthError(
                {
                    "code": "invalid_header",
                    "description": "Unable to parse authentication token.",
                },
                400,
            )
    raise AuthError(
        {
            "code": "invalid_header",
            "description": "Unable to find the appropriate key.",
        },
        400,
    )


def requires_auth(permission=""):
    def requires_auth_decorator(f):
        @wraps(f)
        def wrapper(*args, **kwargs):
            token = get_token_auth_header()
            payload = verify_decode_jwt(token)
            check_permissions(permission, payload)
            return f(payload, *args, **kwargs)

        return wrapper

    return requires_auth_decorator
