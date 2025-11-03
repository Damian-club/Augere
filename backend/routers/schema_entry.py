from schemas.message import Message
from core.db import get_db
from uuid import UUID

# API ------------------
from fastapi import (
    APIRouter,
    Depends
)
#-----------------------

# SCHEMAS --------------------------
from schemas.schema_entry import (
    SchemaEntryCreate,
    SchemaEntryUpdate,
    SchemaEntryOut
)
#-----------------------------------

# SERVICES --------------------------
from services.schema_entry import (
    create_schema_entry,
    delete_schema_entry,
    get_schema_entry,
    update_schema_entry
)
#------------------------------------

router = APIRouter(prefix="/schema_entry", tags=["Schema Entry"])


@router.post("/", response_model=SchemaEntryOut)
def r_create_schema_entry(schema_entry_create: SchemaEntryCreate, db=Depends(get_db)) -> SchemaEntryOut:
    return create_schema_entry(schema_entry_create, db=db)


@router.get("/{uuid}", response_model=SchemaEntryOut)
def r_get_schema_entry(uuid: UUID, db=Depends(get_db)) -> SchemaEntryOut:
    return get_schema_entry(uuid, db=db)


@router.put("/{uuid}", response_model=SchemaEntryOut)
def r_update_schema_entry(uuid: UUID, schema_entry_update: SchemaEntryUpdate, db=Depends(get_db)) -> SchemaEntryOut:
    return update_schema_entry(uuid, schema_entry_update=schema_entry_update, db=db)


@router.delete("/{uuid}", response_model=Message)
def r_delete_schema_entry(uuid: UUID, db=Depends(get_db)) -> Message:
    return delete_schema_entry(uuid, db=db)
