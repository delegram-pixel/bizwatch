import sys
from io import BytesIO
from markitdown import MarkItDown

data = sys.stdin.buffer.read()
md = MarkItDown()
result = md.convert_stream(BytesIO(data), file_extension=".pdf")
sys.stdout.write(result.text_content)
