import { useEffect, useRef } from "react";

function MyCkeditor({ id, value = "", onChange, onReady, disabled = false }) {
  const editorRef = useRef(null);

  useEffect(() => {
    if (!window.CKEDITOR) return;

    // destroy existing instance (important for modal)
    if (window.CKEDITOR.instances[id]) {
      window.CKEDITOR.instances[id].destroy(true);
    }

    const editor = window.CKEDITOR.replace(id, {
      readOnly: disabled,
      height: 250,
    });

    // set initial data
    editor.setData(value || "");

    // change listener
    editor.on("change", () => {
      const data = editor.getData();
      onChange && onChange(data);
    });

    editorRef.current = editor;
    onReady && onReady(editor);

    return () => {
      if (editorRef.current) {
        editorRef.current.destroy(true);
      }
    };
  }, [id]);

  return <textarea id={id} />;
}

export default MyCkeditor;
