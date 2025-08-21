from claude_client.client import tutor

if __name__ == "__main__":
    prompt = "Whats the difference between chicken and turkey"
    poem = tutor(prompt)
    # print(poem)