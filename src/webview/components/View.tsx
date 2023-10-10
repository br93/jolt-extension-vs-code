import Button from "./Button";

interface View {
    title: string
}

function View({title}: View) {
    return (
        <div className='view'>
            <span className='view-title'>{title}</span>
            <Button title='Create input/spec' id='windows'></Button>
            <br></br>
            <Button title='JOLT Transformation' id='jolt'></Button>
        </div>
    );
}

export default View;