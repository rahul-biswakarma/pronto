#!/bin/bash

# Check if Ollama is installed
if ! command -v ollama &> /dev/null; then
    echo "Ollama is not installed. Please install it first."
    echo "Visit https://ollama.com/download for installation instructions."
    exit 1
fi

# Pull the Llama model
echo "Pulling Llama3 model from Ollama..."
ollama pull llama3

echo "Ollama setup complete! You can now run the application with 'bun dev'."
echo "Make sure the Ollama service is running in the background."
