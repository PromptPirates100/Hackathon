import google.generativeai as genai

# Paste your Gemini API key here
API_KEY = "YOUR_GEMINI_API_KEY"

genai.configure(api_key=API_KEY)

model = genai.GenerativeModel("gemini-1.5-flash")

print("Type 'exit' to stop.\n")

while True:
    prompt = input("You: ")

    if prompt.lower() == "exit":
        break

    response = model.generate_content(prompt)

    print("\nGemini:", response.text)
    print("-" * 50)