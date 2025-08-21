import re
import json

def clean_claude_response(content):
    if isinstance(content, list) and hasattr(content[0], 'text'):
        raw_text = content[0].text
    else:
        return {"Error": "Unsupported content format"}

    # Extract JSON code blocks
    json_blocks = re.findall(r'```json\n(.*?)\n```', raw_text, re.DOTALL)

    # Parse each block
    parsed = []
    for block in json_blocks:
        try:
            parsed.append(json.loads(block))
        except json.JSONDecodeError as e:
            print(f"Failed to parse: {e}\n{block}")
    
    return parsed