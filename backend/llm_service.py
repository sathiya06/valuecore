import os
from typing import Dict, Any, Optional, List
from dotenv import load_dotenv

# LangChain imports
from langchain_openai import ChatOpenAI
from langchain.prompts import ChatPromptTemplate, MessagesPlaceholder
from langchain.schema import SystemMessage, AIMessage, HumanMessage
from pydantic import BaseModel, Field

# Load environment variables
load_dotenv()

class ROIResponse(BaseModel):
    """
    Response model for structured LLM output
    """
    answer: str = Field(description="The response to the user's question")
    action: Optional[List[List[Any]]] = Field(
        default=None,
        description="Action to update UI fields, if any - list of [field, value] pairs"
    )

class LLMService:
    """
    LangChain-based LLM service for ROI Calculator
    Uses tools for structured field updates and maintains chat history
    """
    def __init__(self, api_key: Optional[str] = None):
        """
        Initialize the LLM service with LangChain
        Args:
            api_key: Optional OpenAI API key
        """
        self.api_key = api_key or os.getenv('OPENAI_API_KEY')
        if not self.api_key:
            raise ValueError(
                "OpenAI API key is required. Set OPENAI_API_KEY environment variable or pass api_key parameter."
            )

        # System prompt only added once to chat history
        self.system_prompt = self._get_system_prompt()
        self.chat_history: List[Any] = [SystemMessage(content=self.system_prompt)]

        # Initialize ChatOpenAI
        llm = ChatOpenAI(
            openai_api_key=self.api_key,
            model_name="gpt-4.1-nano",
            temperature=0.7
        )
        self.structured_llm = llm.with_structured_output(ROIResponse, method="json_mode")

        # Prompt template uses only chat_history, UI context, and user input
        self.prompt = ChatPromptTemplate([
            MessagesPlaceholder(variable_name="chat_history"),
            MessagesPlaceholder(variable_name="current_ui_context"),
            ("human", "{input}")
        ])

    def run(self, message: str, ui_context: Dict[str, Any]):
        """
        Process a user message and return the agent's structured response
        Also updates the chat history to include the latest exchange

        Args:
            message: User input message
            ui_context: Current UI state context

        Returns:
            Response as a JSON-serializable dict with `answer` and optional `action`
        """
        # Format the current UI context as a system message
        context_msg = SystemMessage(content=f"Current UI Context:\n{ui_context}")

        # Build prompt with history and new context
        formatted = self.prompt.format_messages(
            chat_history=self.chat_history,
            current_ui_context=[context_msg],
            input=message
        )
        print(f"Formatted prompt: {formatted}")

        # Invoke LLM and get structured response
        response: ROIResponse = self.structured_llm.invoke(formatted)

        # Append user and assistant messages to chat history
        self.chat_history.append(HumanMessage(content=message))
        self.chat_history.append(AIMessage(content=response.answer))
        self.chat_history.append(context_msg)

        # Return as dict
        return response.model_dump_json()

    def _get_system_prompt(self) -> str:
        """Get the system prompt for the agent"""
        return """You are an intelligent Copilot Chatbot designed to assist users with a multi-section ROI calculator UI.  
                Your specialty is:  
                1. Reading and understanding all visible UI information (summary text, input fields, output fields, charts, help text).  
                2. Answering questions based on the current UI state.  
                3. Updating input fields dynamically when the user requests changes.  
                4. Only can update the following input fields available in the UI context
                5. Must return responses in a structured JSON format with the fields: `answer` (your response to the user), `action` (the command to update the UI, if any - it is an array of only strings for example [[field1, value1], [field2, value2]]).  
          """ 
