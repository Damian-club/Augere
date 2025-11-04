from pydantic import BaseModel, Field
from schemas.ai_chat import AIChatOut
from schemas.schema_entry import EntryType

class Prompt(BaseModel):
    prompt: str = Field(...)

class PromptSchemaEntry(BaseModel):
    entry_type: EntryType = Field(..., title="Entry type", description="Determines if this entry is an explanation or an assignment")
    name: str = Field(..., title="Name", description="The name of each entry, could be either an explanation or an assignment")
    body: str = Field(..., title="Body", description="This is the body, where it is either an explanation or an assignment. This is what the user sees, and must be given in a markdown format.")
    context: str = Field(..., title="Context", description="Context to be considered when grading assignments, or asking the AI about the topic. Must be concise, keeping in mind the AI will only be able to see this and the user's prompt/answer.")

class PromptSchemaCategory(BaseModel):
    name: str = Field(..., title="Category name", description="This determines the name of a given category")
    entry_list: list[PromptSchemaEntry] = Field(..., title="Entry list", description="For each category, this is the list that determines the entries of each category")

class PromptSchemaFull(BaseModel):
    category_list: list[PromptSchemaCategory] = Field(..., title="Category list", description="For the schema, this is the list that determines each category for a given course")

class PromptAssignmentData(BaseModel):
    success: bool = Field(..., title="Assignment success", description="Given the context and answer, this determines if the answer is correct or not")
    feedback: str = Field(..., title="Feedback", description="Given the context and answer, if the answer is correct, could be a suggestion or just congratulations, if not, this says what went wrong")