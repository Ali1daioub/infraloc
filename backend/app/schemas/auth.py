from pydantic import BaseModel, EmailStr
from uuid import UUID


class UserRegister(BaseModel):
    email: EmailStr
    password: str
    full_name: str
    org_name: str | None = None


class UserLogin(BaseModel):
    email: EmailStr
    password: str


class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"


class UserResponse(BaseModel):
    id: UUID
    email: str
    full_name: str
    is_active: bool

    model_config = {"from_attributes": True}
