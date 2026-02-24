import json
import re
from datetime import datetime
from collections import defaultdict

# Input and output files
input_file = r"C:\Users\SyifaAnjay\.claude\projects\c--Users-SyifaAnjay--gemini-antigravity-playground-static-feynman\e7124680-8573-494c-ad14-98864cd331e4.jsonl"
output_file = r"D:\ALMA\memory\antigravity_extracted.json"

# Data structures
conversations = []
tasks = []
user_messages = []
assistant_messages = []
thinking_content = []
tool_calls = []

# Parse the JSONL file
with open(input_file, 'r', encoding='utf-8') as f:
    for line_num, line in enumerate(f, 1):
        line = line.strip()
        if not line:
            continue

        try:
            data = json.loads(line)

            # Extract basic message info
            if 'message' in data:
                msg = data['message']
                role = msg.get('role', '')
                content = msg.get('content', [])
                timestamp = data.get('timestamp', '')
                uuid = data.get('uuid', '')

                if role == 'user':
                    for item in content:
                        if item.get('type') == 'text':
                            user_messages.append({
                                'line': line_num,
                                'uuid': uuid,
                                'timestamp': timestamp,
                                'text': item.get('text', '')
                            })

                elif role == 'assistant' or data.get('type') == 'assistant':
                    model = msg.get('model', 'unknown')
                    for item in content:
                        if item.get('type') == 'text':
                            assistant_messages.append({
                                'line': line_num,
                                'uuid': uuid,
                                'timestamp': timestamp,
                                'model': model,
                                'text': item.get('text', '')
                            })
                        elif item.get('type') == 'thinking':
                            thinking_content.append({
                                'line': line_num,
                                'uuid': uuid,
                                'timestamp': timestamp,
                                'thinking': item.get('thinking', '')
                            })
                        elif item.get('type') == 'tool_use':
                            tool_calls.append({
                                'line': line_num,
                                'uuid': uuid,
                                'timestamp': timestamp,
                                'tool': item.get('name', ''),
                                'input': item.get('input', '')
                            })

            # Check for task-related content
            if 'type' in data:
                if data['type'] == 'task':
                    tasks.append(data)

            conversations.append(data)

        except json.JSONDecodeError:
            continue

# Summary
print(f"Total lines processed: {line_num}")
print(f"User messages: {len(user_messages)}")
print(f"Assistant messages: {len(assistant_messages)}")
print(f"Thinking content: {len(thinking_content)}")
print(f"Tool calls: {len(tool_calls)}")

# Save to JSON
output_data = {
    'summary': {
        'total_lines': line_num,
        'user_messages': len(user_messages),
        'assistant_messages': len(assistant_messages),
        'thinking_content': len(thinking_content),
        'tool_calls': len(tool_calls),
        'tasks': len(tasks)
    },
    'user_messages': user_messages,
    'assistant_messages': assistant_messages,
    'thinking_content': thinking_content,
    'tool_calls': tool_calls,
    'tasks': tasks
}

with open(output_file, 'w', encoding='utf-8') as f:
    json.dump(output_data, f, indent=2, ensure_ascii=False)

print(f"\nData saved to {output_file}")

# Print conversation summary
print("\n=== CONVERSATION FLOW ===\n")
for i, msg in enumerate(user_messages[:20]):  # First 20 user messages
    print(f"\n[{i+1}] USER ({msg['timestamp'][:19]}):")
    print(f"  {msg['text'][:200]}...")
