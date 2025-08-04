import llm_service, json

llm_service = llm_service.LLMService()

def update_ui_context(actions, ui_context):
    """
    Update the ui_context dict based on actions returned by the LLM.
    Only updates keys that already exist in ui_context.
    """
    for key, value in actions:
        if key in ui_context:
            ui_context[key] = value
    return ui_context


def main():
    # Default UI context
    ui_context = {"employee": "250", "company_name": "sathya"}
    print("Starting chat. Type 'end' to exit.")

    while True:
        user_input = input("You: ")
        if user_input.strip().lower() == "end":
            print("Chat session ended.")
            break

        # Call the LLM service with the current UI context
        response = llm_service.run(
            message=user_input,
            ui_context=ui_context
        )

        # Parse the response to extract actions
        try:
            print(f"LLM Response (raw): {response}")
            parsed = json.loads(response)
            print(parsed)
            actions = parsed.get("action", [])
            print(f"LLM Response: {parsed.get('answer', 'No message')}")
        except json.JSONDecodeError:
            actions = []

        # Update UI context if actions provided
        if actions:
            ui_context = update_ui_context(actions, ui_context)
            print(f"Updated UI context: {ui_context}\n")

if __name__ == "__main__":
    main()

# response = llm_service.run(
#     message=" what is the company name?",
#     ui_context={"employee": "250", "company_name": "sathya"}
# )

# print(response.model_dump_json())