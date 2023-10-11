import Button from "./Button";

interface View {
    title_panel_1: string,
    title_panel_2: string
}

function View({title_panel_1, title_panel_2}: View) {
    return (
        <div>
        <div className='view'>
            <span className='view-title'>{title_panel_1}</span>
            <Button title='Create input/spec' id='jolt-windows'></Button>
            <br></br>
            <Button title='JOLT Transformation' id='jolt'></Button>
        </div>

        <div className='view'>
            <span className='view-title'>{title_panel_2}</span>
            <Button title='Create jslt/json' id='jslt-windows'></Button>
            <br></br>
            <Button title='JSLT Transformation' id='jslt'></Button>
        </div>
        </div>
    );
}

export default View;