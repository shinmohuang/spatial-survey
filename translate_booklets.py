import os
import json
from openai import OpenAI
import time
import sys

# --- DeepSeek API Configuration ---
api_key = os.environ.get("DEEPSEEK_API_KEY")
if not api_key:
    print("Error: DEEPSEEK_API_KEY environment variable not set.")
    sys.exit(1)

client = OpenAI(
    api_key=api_key,
    base_url="https://api.deepseek.com"
)
# ---


def translate_text(text, dest_language='Chinese'):
    """Translates text using the DeepSeek API."""
    if not text:
        return ""
    try:
        # Add a small delay to avoid hitting API rate limits too quickly
        time.sleep(1)

        chat_completion = client.chat.completions.create(
            model="deepseek-chat",
            messages=[
                {"role": "system", "content": "You are a helpful translation assistant."},
                {"role": "user", "content": f"Translate the following English text to {dest_language}, providing only the translated text and nothing else:\n\n---\n\n{text}"}
            ],
            max_tokens=2048,
            temperature=0,
        )
        return chat_completion.choices[0].message.content.strip()
    except Exception as e:
        print(f"Error translating text: '{text[:50]}...'. Error: {e}")
        return text  # Return original text on failure


def process_booklets(directory_path):
    """
    Processes all booklet JSON files in a directory, translating the 'question'
    field and adding a 'question_zh' field.
    """
    for filename in sorted(os.listdir(directory_path)):
        if filename.endswith('.json'):
            file_path = os.path.join(directory_path, filename)
            print(f"Processing {file_path}...")

            try:
                with open(file_path, 'r', encoding='utf-8') as f:
                    data = json.load(f)
            except (json.JSONDecodeError, UnicodeDecodeError):
                print(f"  - Skipping {filename}, could not decode JSON.")
                continue

            # The root of the json should be a list
            if not isinstance(data, list):
                print(
                    f"  - Skipping {filename}, expected a list of questions, but found {type(data).__name__}.")
                continue

            updated = False
            for item in data:
                # Add a check to ensure the item is a dictionary
                if not isinstance(item, dict):
                    continue

                # Check if question exists and is non-empty
                if item.get('question'):
                    # Translate if question_zh is missing or empty
                    if not item.get('question_zh'):
                        original_question = item['question']
                        print(f"  - Translating: {original_question[:50]}...")

                        translated_question = translate_text(original_question)
                        item['question_zh'] = translated_question
                        updated = True

            # Write the updated data back to the file
            if updated:
                with open(file_path, 'w', encoding='utf-8') as f:
                    json.dump(data, f, indent=4, ensure_ascii=False)
                print(
                    f"  - Finished processing and saved updates for {filename}.")
            else:
                print(
                    f"  - No new questions to translate in {filename}. Skipping save.")


if __name__ == '__main__':
    # The script is in spatial-survey, booklets are in frontend/public/booklets
    booklets_dir = os.path.join(os.path.dirname(
        __file__), 'frontend', 'public', 'booklets')
    process_booklets(booklets_dir)
    print("\nTranslation process complete.")
