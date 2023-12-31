import { db } from '../../_Firebase/firebaseConfig';
import { getDoc, doc, addDoc, collection } from 'firebase/firestore';
import { useEffect, useState } from 'react';
import {v4 as uid} from 'uuid'
function Assessment({user}) {

const [data, setData] = useState([]);
const [qa, setQa] = useState({
    0: '', 1:'', 2: '', 3: '', 4: ''
})

const [sendData, setSendData] = useState({})


const handleAnswerChange = (questionIndex, answer) => {
    setQa((prevQa) => ({
    ...prevQa,
    [questionIndex]: answer,
    }));
};


const fetchResponse = async (prompt_template) => {
    let response = '';
    
    let prev_text = prompt_template;
    let generated_text = '';
    let resp;

    try {
    
        const res = await fetch(
        'https://api-inference.huggingface.co/models/mistralai/Mistral-7B-Instruct-v0.1',
        {
            headers: {
            Authorization: 'Bearer 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',
            'Content-Type': 'application/json', // Add this line to set the content type
            },
            method: 'POST',
            body: JSON.stringify({ inputs: prev_text }), // Correct the structure of the payload
        }
        );

        resp = await res.json();
        generated_text = resp[0]['generated_text'].split(prev_text)[1];
        prev_text += generated_text;

        console.log(generated_text); // Log the generated text for debugging
    

    response = resp[0]['generated_text'].split(prompt_template)[1];

    // After finishing fetching -
    // Commented out because setLoadingResponse is not defined
    response = await response.split('</end>')[0]
    return response;
    } catch (err) {
    console.error(err);
    return '';
    }
};

const fetchScores = async () => {

    const prompt_template =  `
    You are an AI assistant that grades 5 questions and answers on a scale of 1 to 5.
    You must grade the essay answer, based on its conciseness and relevance to the given question.
    You must give the questions a grade between 1 to 5.
    If no answer was given, deduce the grade as 0.
    As a response, you only give a list of 5 space seperated integers, a grade for each consecutive question, followed by the characters '</end>' and no other text should be generated.
    The questions and answers are :
    Question 1 : ${assessments[ 'Solar System and its Wonders']['questions'][0]}  Answer 1 : ${qa['0']},
    Question 2 : ${assessments[ 'Solar System and its Wonders']['questions'][1]}  Answer 2 : ${qa['1']},
    Question 3 : ${assessments[ 'Solar System and its Wonders']['questions'][2]}  Answer 3 : ${qa['2']},
    Question 4 : ${assessments[ 'Solar System and its Wonders']['questions'][3]}  Answer 4 : ${qa['3']}, 
    Question 5 : ${assessments[ 'Solar System and its Wonders']['questions'][4]}  Answer 5 : ${qa['4']}, 
    Please grade the answers between 1 to 5, where 1 is the worst answer and 5 is a very good answer and 0 meaning no answer given.
    Answer : 
    `

    const response = await fetchResponse(prompt_template)

    const arrayOfIntegers = response.trim().split(/\s+/).map(Number);
    const sum = arrayOfIntegers.reduce((accumulator, currentValue) => accumulator + currentValue, 0);
    const average = sum / arrayOfIntegers.length;

    const newdata = {
    'displayName' : user.displayName,
    'uid' : user.uid,
    'cid' : 101,
    'course_name' :  'Solar System and its Wonders',
    'scores' : {
        '1' : arrayOfIntegers[0],
        '2' : arrayOfIntegers[1],
        '3' : arrayOfIntegers[2],
        '4' : arrayOfIntegers[3],
        '5' : arrayOfIntegers[4],
        'sum' : sum,
        'average' : average 
    }
    }

    setSendData(newdata)

    try {
    // LOGIC TO CREATE POST THRU FIREBASE FIRESTORE
    const docRef = await addDoc(collection(db, 'course_results'), newdata);

    console.log('Document written with ID: ', docRef.id);
    } catch (err) {
    console.error(err);
    }

    console.log(arrayOfIntegers, sum, average);



}

const assessments =  {
    "Solar System and its Wonders": {
        
        'questions' : [
            "What is the composition of Mars' atmosphere?",
            "What is the size of Jupiter's Red Spot, comparing approximately to the size of the Earth?",
            "What is the solar system composed of?",
            "How does the orbit of a planet affect its climate?",
            "What is the largest moon in the solar system, and which planet does it revolve around?"
        ]
    },
    
    
}



return (
    <div className='assessmentContainer'>
    <h2>Assessment Time!</h2>
    
        <>
        {assessments['Solar System and its Wonders']['questions'].map((question, index) => (
            <div key={index} className='questionContainer'>
            <div className='questionText'>{index + 1}. {question}</div>
            <textarea
                placeholder='Enter your answer here'
                className='answerText'
                id=''
                cols='70'
                onChange={(e) => handleAnswerChange(index, e.target.value)}
            ></textarea>
            </div>
        ))}
        <div style={{display:'flex', justifyContent:'center'}}>
        <div className='submitBtn' onClick={fetchScores}>Submit</div>
        </div>
        </>
    

    
    </div>
);
}

export default Assessment;
