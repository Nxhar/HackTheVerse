import { useState, useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import './roadmap.css';
import { roadmaps } from './roadmaps';

// Register ScrollTrigger with GSAP
gsap.registerPlugin(ScrollTrigger);

// Define the timeline outside the component
const t1 = gsap.timeline();

function Roadmap() {
  const [submittedCheckBox, setSubmittedCheckBox] = useState(false);
  const [checkboxes, setCheckboxes] = useState({
    webDev: false,
    ai: false,
    robotics: false,
  });

  const [currentRoadmap, setCurrentRoadmap] = useState({});
  const roadmapContentRef = useRef(null);

  const handleCheckboxChange = (checkboxName) => {
    setCheckboxes({
      ...checkboxes,
      [checkboxName]: !checkboxes[checkboxName],
    });
  };

  const handleSubmit = () => {
    if (checkboxes.ai === false && checkboxes.robotics === false && checkboxes.webDev === false) {
      return;
    }

    console.log('Checked Checkboxes:', checkboxes);
    if (checkboxes.webDev === true && checkboxes.ai === true && checkboxes.robotics === false) {
      setCurrentRoadmap(roadmaps[0]);
    } else if (checkboxes.webDev === false && checkboxes.ai === true && checkboxes.robotics === true) {
      setCurrentRoadmap(roadmaps[1]);
    } else if (checkboxes.webDev === true && checkboxes.ai === false && checkboxes.robotics === true) {
      setCurrentRoadmap(roadmaps[2]);
    } else if (checkboxes.webDev === true && checkboxes.ai === true && checkboxes.robotics === true) {
      setCurrentRoadmap(roadmaps[3]);
    }

    console.log(currentRoadmap);

    setSubmittedCheckBox(true);
  };

  useEffect(() => {
    // GSAP ScrollTrigger Animation
    if (submittedCheckBox) {
      // Use forEach to create a ScrollTrigger for each roadmapContent
      document.querySelectorAll('.roadmapContent').forEach((element, index) => {
        gsap.from(element, {
          opacity: 0,
          y: 50,
          duration: 1,
          scrollTrigger: {
            trigger: element,
            start: 'top 80%',
            end: 'bottom 20%',
            toggleActions: 'play none none reverse',
          },
        });
      });
    }
  }, [submittedCheckBox]);

  return (
    <div className='roadmapsContainer'>
      {!submittedCheckBox ? (
        <>
          <div className='centerContain'>
            <h3>Roadmaps.</h3>
            <p>Just a few clicks of buttons, to get your personalized Roadmaps!</p>

            <div className='Checkboxes'>
              <label>
                <input
                  type='checkbox'
                  checked={checkboxes.checkbox1}
                  onChange={() => handleCheckboxChange('webDev')}
                />
                Web Development
              </label>

              <label>
                <input
                  type='checkbox'
                  checked={checkboxes.checkbox2}
                  onChange={() => handleCheckboxChange('ai')}
                />
                Artificial Intelligence and Machine Learning
              </label>

              <label>
                <input
                  type='checkbox'
                  checked={checkboxes.checkbox3}
                  onChange={() => handleCheckboxChange('robotics')}
                />
                Robotics
              </label>
            </div>

            <div className='submitBTN' onClick={handleSubmit}>
              Submit
            </div>
          </div>
        </>
      ) : (
        <div className='roadmapContainer' ref={roadmapContentRef}>
            <div className="LetsBegin">Let's Begin The Journey, Shall We?</div>
          <h3>{currentRoadmap['title']}</h3>
          {currentRoadmap ? (
            currentRoadmap['content'].map((element, index) => (
              <div className={`roadmapContent ${index}`} key={index}>
                <div className='contentTitle'>{element.title}</div>
                <div className='contentDesc'>{element.desc}</div>
              </div>
            ))
          ) : (
            <>
            </>
          )}
        </div>
      )}
    </div>
  );
}

export default Roadmap;
