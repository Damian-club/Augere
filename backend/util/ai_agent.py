from openai import OpenAI
from openai.types.chat.parsed_chat_completion import ParsedChatCompletion
from models.ai_chat import Author
import config.prompts as prompts
import config.ai_agent as ai_agent_config
from schemas.ai_util import (
    PromptSchemaFull,
    PromptAssignmentData
)
from schemas.ai_chat import AIChatOut
from fastapi import HTTPException

def map_message_author(author: Author) -> str:
    return {
        "ai": "assistant",
        "user": "user"
    }.get(author.value, "user")

class AIAgent():
    def __init__(self, client: OpenAI):
        self.client: OpenAI = client

    def generate_hint(self, prompt: str, context: str, ai_chat_out_list: list[AIChatOut]) -> str:
        message_hint: list[dict[str, str]] = [
            {"role": map_message_author(message.author), "content": message.content}
            for message in ai_chat_out_list
        ] + [{"role": "user", "content": prompt}]

        try:
            from openai.types.chat.chat_completion_message import ChatCompletionMessage

            response: ParsedChatCompletion[PromptSchemaFull] = self.client.beta.chat.completions.parse(
                model=ai_agent_config.DEFAULT_MODEL,
                messages=[
                    {"role": "developer", "content": prompts.HINT_PROMPT},
                    {"role": "developer", "content": f"Contexto: {context}"},
                    *message_hint
                ]
            )

            output_message: str = response.choices[0].message.content or "..."

            return output_message
        except Exception as e:
            raise HTTPException(status_code=403, detail=f'Error al hacer inferencia: {e}')
    
    # def generate_schema(self, prompt: str) -> PromptSchemaFull:
    #     try:
    #         response: ParsedChatCompletion[PromptSchemaFull] = self.client.beta.chat.completions.parse(
    #             model=ai_agent_config.DEFAULT_MODEL,
    #             messages=[
    #                 {"role": "developer", "content": prompts.SCHEMA_PROMPT},
    #                 {"role": "user", "content": prompt},
    #             ],
    #             response_format=PromptSchemaFull
    #         )

    #         asserted: PromptSchemaFull | None = response.choices[0].message.parsed

    #         assert asserted is not None

    #         # 🧩 FIX: Forzar decodificación UTF-8 en todos los campos string
    #         def fix_encoding(obj):
    #             if isinstance(obj, str):
    #                 try:
    #                     return obj.encode("latin1").decode("utf-8")
    #                 except Exception:
    #                     return obj
    #             elif isinstance(obj, list):
    #                 return [fix_encoding(o) for o in obj]
    #             elif isinstance(obj, dict):
    #                 return {k: fix_encoding(v) for k, v in obj.items()}
    #             else:
    #                 return obj
            
    #         asserted = fix_encoding(asserted)
                
    #         return asserted
    #     except Exception as e:
    #         raise HTTPException(status_code=403, detail=f'Error al hacer inferencia: {e}')
        
    def generate_schema(self, prompt: str) -> PromptSchemaFull:
        try:
            response: ParsedChatCompletion[PromptSchemaFull] = self.client.beta.chat.completions.parse(
                model=ai_agent_config.DEFAULT_MODEL,
                messages=[
                    {"role": "developer", "content": prompts.SCHEMA_PROMPT},
                    {"role": "user", "content": prompt},
                ],
                response_format=PromptSchemaFull
            )

            asserted: PromptSchemaFull | None = response.choices[0].message.parsed
            assert asserted is not None

            # 🧩 FIX SEGURO: Detectar y corregir solo si hay caracteres mal decodificados
            def fix_encoding(obj):
                if isinstance(obj, str):
                    try:
                        # Si contiene caracteres "�" o secuencias típicas mal decodificadas (m�, �f3, etc)
                        if any(bad in obj for bad in ["�", "Ã", "Â", "ð", "f3", "e9", "ed"]):
                            # Intentar re-decodificar correctamente
                            try:
                                return obj.encode("latin1").decode("utf-8")
                            except Exception:
                                return obj.encode("utf-8", errors="ignore").decode("utf-8", errors="ignore")
                        return obj
                    except Exception:
                        return obj
                elif isinstance(obj, list):
                    return [fix_encoding(o) for o in obj]
                elif isinstance(obj, dict):
                    return {k: fix_encoding(v) for k, v in obj.items()}
                else:
                    return obj

            asserted = fix_encoding(asserted)
            return asserted

        except Exception as e:
            raise HTTPException(status_code=403, detail=f'Error al hacer inferencia: {e}')

        
        
    def generate_feedback(self, prompt: str, context: str) -> PromptAssignmentData:
        try:
            response: ParsedChatCompletion[PromptAssignmentData] = self.client.beta.chat.completions.parse(
                model=ai_agent_config.DEFAULT_MODEL,
                messages=[
                    {"role": "developer", "content": prompts.FEEDBACK_PROMPT},
                    {"role": "user", "content": f'Contexto: {context}\nRespuesta: {prompt}'},
                ],
                response_format=PromptAssignmentData
            )

            asserted: PromptAssignmentData | None = response.choices[0].message.parsed

            assert asserted is not None

            return asserted
        except Exception as e:
            raise HTTPException(status_code=403, detail=f'Error al hacer inferencia: {e}')
    
if __name__ == '__main__':
    from core.ai_client import ai_client
    ai_agent: AIAgent = AIAgent(ai_client)

    # Prueba de integridad del hint
    from uuid import uuid4
    from datetime import datetime
    hint: str = ai_agent.generate_hint(
        prompt="¿Como debo hacer una suma? No te entendi bien.",
        context="Objetivos: practicar sumas básicas de un dígito; desarrollar fluidez y aplicar descomposición si ayuda. Criterios: exactitud y claridad del procedimiento.",
        ai_chat_out_list=[
            AIChatOut(
                author=Author.AI,
                content="¿Como puedo ayudarte?",
                uuid=uuid4(),
                progress_uuid=uuid4(),
                creation_date=datetime.now()
            ),
            AIChatOut(
                author=Author.USER,
                content="No entiendo como hacer la suma",
                uuid=uuid4(),
                progress_uuid=uuid4(),
                creation_date=datetime.now()
            ),
            AIChatOut(
                author=Author.AI,
                content="Intenta agrupando los numeros",
                uuid=uuid4(),
                progress_uuid=uuid4(),
                creation_date=datetime.now()
            ),
        ]
    )

    print("Salida: ", hint)