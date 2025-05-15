import React, { useState, useEffect, useRef } from "react";
import "./styles/import-widget.css";
import { isNotLoaded, Loaded, Loading, NotLoaded, Error } from "./utils/load";

export function RenderWidget({ context, app }) {
  const [taskFields, setTaskFields] = useState(NotLoaded());

  useEffect(() => {
    if (isNotLoaded(taskFields)) {
      setTaskFields(Loading());
      app.data
        .invoke("getTaskFields")
        .then((taskFields) => {
          setTaskFields(Loaded(taskFields));
        })
        .catch((error) => {
          setTaskFields(Error(error));
        });
    }
  }, [app, taskFields]);

  const retryLoading = () => {
    setTaskFields(NotLoaded());
  };

  switch (taskFields.status) {
    case "loaded":
      return <CSVUploader fields={taskFields.data} />;
    case "error":
      return <ErrorState error={taskFields.error} onRetry={retryLoading} />;

    case "not-loaded":
    default:
    case "loading":
      return <Loader />;
  }
}

const Loader = () => {
  return (
    <>
      <div className="custom-loader-container">
        <div className="custom-loader-spinner"></div>
        <div className="custom-loader-text">Loading...</div>
      </div>
    </>
  );
};

const ErrorState = ({ error, onRetry }) => {
  return (
    <div className="error-container">
      <div className="error-icon">⚠️</div>
      <div className="error-title">Something went wrong</div>
      <div className="error-message">
        {error?.message ||
          "There was an error loading the data. Please try again."}
      </div>
      <button className="error-retry-button" onClick={onRetry}>
        Try Again
      </button>
    </div>
  );
};

const CSVUploader = ({ fields }) => {
  const [file, setFile] = useState(null);
  const [columns, setColumns] = useState([]);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef(null);

  const handleFileChange = (event) => {
    const selectedFile = event.target.files[0];
    if (selectedFile && selectedFile.type === "text/csv") {
      setFile(selectedFile);
      parseCSV(selectedFile);
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const droppedFile = e.dataTransfer.files[0];
      if (droppedFile.type === "text/csv") {
        setFile(droppedFile);
        parseCSV(droppedFile);
      }
    }
  };

  const parseCSV = (csvFile) => {
    const reader = new FileReader();

    reader.onload = (event) => {
      const csvText = event.target.result;
      const lines = csvText.split("\n");

      if (lines.length > 0) {
        // Extract header row (first line)
        const headerLine = lines[0].trim();

        // Handle different delimiters (comma, semicolon, tab)
        let delimiter = ",";
        if (headerLine.includes(";")) delimiter = ";";
        else if (headerLine.includes("\t")) delimiter = "\t";

        const headers = headerLine
          .split(delimiter)
          .map((header) => header.trim().replace(/^"|"$/g, ""));

        setColumns(headers.filter((header) => header));
      }
    };

    reader.readAsText(csvFile);
  };

  const handleClick = () => {
    fileInputRef.current.click();
  };

  return (
    <div className="csv-upload-container">
      <div
        className={`upload-area ${isDragging ? "drag-active" : ""}`}
        onClick={handleClick}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        <div className="upload-icon">📄</div>
        <div className="upload-text">
          {file
            ? "Replace CSV file"
            : "Drop your CSV file here or click to browse"}
        </div>
        <div className="upload-subtext">Only CSV files are supported</div>
        <input
          type="file"
          ref={fileInputRef}
          className="file-input"
          accept=".csv"
          onChange={handleFileChange}
        />
        {file && (
          <div className="file-name">
            Selected file: <span className="file-name-text">{file.name}</span>
          </div>
        )}
      </div>

      {columns.length > 0 && (
        <div className="csv-columns-container">
          <div className="csv-columns-title">
            {columns.length} Column{columns.length !== 1 ? "s" : ""} Found:
          </div>
          <div className="column-list">
            {columns.map((column, index) => (
              <div key={index} className="column-item">
                {column}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
