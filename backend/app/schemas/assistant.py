from pydantic import BaseModel


class AssistantQuestion(BaseModel):
    question: str


class AssistantResponse(BaseModel):
    answer: str
    suggested_actions: list[str] = []