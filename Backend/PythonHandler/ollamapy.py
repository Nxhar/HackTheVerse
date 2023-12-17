from langchain.llms import Ollama 

from PyPDF2 import PdfReader

from langchain.embeddings import HuggingFaceEmbeddings
from langchain.text_splitter import CharacterTextSplitter
from langchain.vectorstores import FAISS
from langchain.chains import ConversationalRetrievalChain
from langchain.memory import ConversationBufferMemory

from flask import Flask, request, jsonify
from flask_cors import CORS
from werkzeug.utils import secure_filename
import os
import speech_recognition as sr
import spacy


# Example usage


app = Flask(__name__)
CORS(app, supports_credentials=True)



llm = Ollama(model='mistral', temperature=0.7)

# Load spaCy model
nlp = spacy.load("en_core_web_sm")

# Define categories and subcategories
categories = {
    'Cybersecurity': ['security', 'cybersecurity', 'infosec'],
    'Data Science': ['data science', 'data analysis', 'analytics'],
    'Design': ['design', 'graphic design', 'UI/UX' 'UI'],
    'Digital Marketing': ['digital marketing', 'online marketing', 'social media'],
    'Finance': ['finance', 'financial analysis', 'investment'],
    'Machine Learning': ['machine learning', 'artificial intelligence', 'ml', 'ai', 'robotics', 'robots', 'robo'],
    'Mobile App Development': ['mobile app development', 'app development', 'iOS', 'Android'],
    'Photography': ['photography', 'photo editing'],
    'Programming': ['software', 'programming', 'coding', 'software development', 'dev'],
    'Web Development': ['web development', 'frontend', 'backend', 'full stack','web'],
}

# Function to categorize text into a list of relevant categories
def categorize_text(text):
    doc = nlp(text.lower())
    relevant_categories = []

    # Check for subcategories first
    for category, subcategories in categories.items():
        if any(subcategory in text.lower() for subcategory in subcategories):
            relevant_categories.append(category)

    # Check for main categories
    for category, keywords in categories.items():
        if any(keyword in text.lower() for keyword in keywords):
            relevant_categories.append(category)

    return relevant_categories if relevant_categories else ['Uncategorized']




def get_conversation_chain(file):

    if(type(file) != str):
        reader = PdfReader(file)
        for page in reader.pages:
            text += page.extract_text()
    else:
        text = file

    text_splitter = CharacterTextSplitter(
    separator = "\n",
    chunk_size = 1000,
    chunk_overlap = 200,
    length_function = len
    )

    chunks = text_splitter.split_text(text)


    embeddings = HuggingFaceEmbeddings()

    vectorstore = FAISS.from_texts(texts = chunks , embedding = embeddings)

    memory = ConversationBufferMemory(memory_key='chat_history', return_messages=True)

    conversation_chain = ConversationalRetrievalChain.from_llm(
        llm = llm,
        retriever = vectorstore.as_retriever(search_kwargs={"k": 2}),
        memory = memory
    )

    return conversation_chain





UPLOAD_FOLDER = './uploads'

app.config['UPLOAD_FOLDER'] = UPLOAD_FOLDER



def allowed_file(filename):
    return '.' in filename and filename.rsplit('.', 1)[1].lower() == 'pdf'


@app.route('/upload', methods=['POST','OPTIONS'])
def upload_file():
    global conversation_chain

    if request.method == 'OPTIONS':
        response = jsonify({'message': 'CORS preflight request handled successfully'})
        response.headers.add('Access-Control-Allow-Methods', 'POST')
        return response
    
    print('Called method upload file')

    if 'file' not in request.files:
        return jsonify({'error': 'No file part','message':'error'})

    file = request.files['file']

    print('file found')

    if file.filename == '':
        return jsonify({'error': 'No selected file','message':'error'})

    if file and allowed_file(file.filename):
        print('file is pdf')
        filename = secure_filename(file.filename)
        filepath = os.path.join(app.config['UPLOAD_FOLDER'], filename)
        try:
            filepath = os.path.join(app.config['UPLOAD_FOLDER'], filename)
            print('file saved')

            
        except Exception as e:
            return jsonify({'error': f'Error saving file: {str(e)}', 'message':'error'})
        
        conversation_chain = get_conversation_chain(file)
        return jsonify({'message': 'PDF successfully read! You can now ask me any question regarding it.'})

    else: 
        print('file is audio')

        # Perform speech recognition
        recognizer = sr.Recognizer()
        with sr.AudioFile(file) as audio_file:
            audio_data = recognizer.record(audio_file)
            text = recognizer.recognize_google(audio_data)
        
        conversation_chain = get_conversation_chain(text)
        return jsonify({'message': 'Audio successfully processed! You can now ask me any question regarding it.'})


        


@app.route('/message', methods=['POST','OPTIONS'])
def get_message():
    if request.method == 'OPTIONS':
        response = jsonify({'message': 'CORS preflight request handled successfully'})
        response.headers.add('Access-Control-Allow-Methods', 'POST')
        return response
    
    data = request.get_json()

    if 'message' not in data:
        return jsonify({'error': 'data not found'})
    
    message = data['message']

    result = conversation_chain({"question": message })

    return jsonify({'response':result['answer']})



@app.route('/categorize', methods=['POST', 'OPTIONS'])
def categorize(): 
    if request.method == 'OPTIONS':
        response = jsonify({'message': 'CORS preflight request handled successfully'})
        response.headers.add('Access-Control-Allow-Methods', 'POST')
        return response
    
    data = request.get_json()

    if 'message' not in data:
        return jsonify({'error':'data not found'})
    
    message = data['message']

    result = list(set(categorize_text(message)))

    

    return jsonify({'categories': result})





    

if __name__ == '__main__':
    app.run(debug=True)
