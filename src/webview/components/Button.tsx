function Button(content: { id: string; title: string; }){
    return (
        <button id={content.id}>
            {content.title}
        </button>
    );
}

export default Button;