import ReactQuill from 'react-quill-new';
import "react-quill-new/dist/quill.snow.css";
import { useEffect, useState } from "react";

function TextEditor({lesson, updateLesson, index}) {
    const [content, setContent] = useState(lesson?.textContent || '')
    useEffect(() => {
        setContent(lesson?.textContent || "");
    }, [lesson]);
    
    const handleContentChange = (value) => {
        setContent(value);
        updateLesson(index, 'textContent', value);
        console.log("Content:", value);
    };
    const modules = {
        toolbar: [
            [{ header: [1, 2, false] }], 
            ['bold', 'italic', 'underline'], 
            [{ list: 'ordered' }], 
            ['link', 'image'], 
        ],
    };

    const formats = [
        'header',
        'bold',
        'italic',
        'underline',
        'list',
        'link',
        'image',
    ];

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!content || content.trim() === '<p><br></p>') {
            alert('Content cannot be empty!');
            return;
        }
        console.log('Submitted Content:', content);
    };
    return (
        <div className='flex-1'>
            <form onSubmit={handleSubmit}>
                <ReactQuill
                    theme="snow"
                    value={content}
                    onChange={handleContentChange}
                    modules={modules}
                    formats={formats}
                />
                {/* <button className='bg-transparent' type="submit">Submit</button> */}
            </form>
        </div>
    )
}

export default TextEditor;