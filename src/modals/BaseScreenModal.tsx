import React, { useState, useEffect } from 'react';
import { DraggableModal } from './DraggableModal';
import type { HmiBaseScreen } from '../types/hmi';

interface BaseScreenModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (screen: Omit<HmiBaseScreen, 'id'>) => void;
    existingScreenNumbers: number[];
}

export const BaseScreenModal: React.FC<BaseScreenModalProps> = ({
    isOpen,
    onClose,
    onSave,
    existingScreenNumbers
}) => {
    // --- State for form inputs ---
    const [screenNumber, setScreenNumber] = useState("1");
    const [name, setName] = useState("");
    const [description, setDescription] = useState("");
    const [security, setSecurity] = useState("0");
    const [individualDesign, setIndividualDesign] = useState(false);
    
    // --- State for validation ---
    const [error, setError] = useState<string | null>(null);

    // --- Find the next available screen number ---
    const getNextScreenNumber = () => {
        let num = 1;
        // Sort numbers to find the next available slot
        const sortedNumbers = [...existingScreenNumbers].sort((a, b) => a - b);
        for (const existingNum of sortedNumbers) {
            if (num < existingNum) {
                break; // Found a gap
            }
            if (num === existingNum) {
                num++; // Increment and check next
            }
        }
        return num.toString();
    };
    
    // --- Effect to reset form when opened ---
    useEffect(() => {
        if (isOpen) {
            // Reset fields to default when modal is opened
            setScreenNumber(getNextScreenNumber());
            setName("");
            setDescription("");
            setSecurity("0");
            setIndividualDesign(false);
            setError(null);
        }
    }, [isOpen, existingScreenNumbers]); // Rerun when `isOpen` changes

    const handleSave = () => {
        setError(null);
        const num = parseInt(screenNumber, 10);

        // --- Validation ---
        if (isNaN(num) || screenNumber.trim() === "") {
            setError("Screen Number must be a valid number.");
            return;
        }
        if (num <= 0) {
            setError("Screen Number must be greater than 0.");
            return;
        }
        if (existingScreenNumbers.includes(num)) {
            setError("This Screen Number is already in use.");
            return;
        }
        if (name.trim() === "") {
            setError("Screen Name is required.");
            return;
        }

        // --- All checks passed ---
        onSave({
            screenNumber: num,
            name,
            description,
            security: parseInt(security, 10) || 0,
            individualDesign,
        });
        onClose(); // Close modal on successful save
    };

    // --- Input Handlers ---
    const handleScreenNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const val = e.target.value;
        // Allow only numbers (or empty string)
        if (/^[0-9]*$/.test(val)) {
            setScreenNumber(val);
            if (error) setError(null); // Clear error on change
        }
    };

    const handleDescriptionChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        if (e.target.value.length <= 500) {
            setDescription(e.target.value);
        }
    };
    
    const handleSecurityChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const val = e.target.value;
        if (/^[0-9]*$/.test(val)) {
            setSecurity(val);
        }
    };


    return (
        <DraggableModal
            isOpen={isOpen}
            onClose={onClose}
            title="Base Screen Properties"
            // --- ADDED CLASSNAME TO SET MODAL SIZE ---
            className="modal-content-medium"
            footer={
                <>
                    <button className="btn btn-primary" onClick={handleSave}>OK</button>
                    <button className="btn btn-secondary" onClick={onClose}>Cancel</button>
                </>
            }
        >
            {/* Modal Body */}
            <div className="form-section">
                <span className="section-title">Screen Properties</span>
                <div className="form-group">
                    <label htmlFor="screenNum">Screen Number:</label>
                    <input 
                        id="screenNum" 
                        type="text" // Use text to allow empty state and custom validation
                        value={screenNumber} 
                        onChange={handleScreenNumberChange}
                        style={{width: '100px'}}
                    />
                </div>
                <div className="form-group">
                    <label htmlFor="screenName">Screen Name:</label>
                    <input 
                        id="screenName" 
                        type="text" 
                        value={name} 
                        onChange={(e) => setName(e.target.value)}
                    />
                </div>
                <div className="form-group vertical">
                    <label htmlFor="screenDesc">Description:</label>
                    <textarea 
                        id="screenDesc" 
                        value={description} 
                        onChange={handleDescriptionChange}
                        placeholder="Maximum 500 characters"
                    />
                    <span className="char-counter">{description.length} / 500</span>
                </div>
            </div>

            {/* Error Message Display */}
            {error && <div className="modal-error">{error}</div>}

            <fieldset className="form-fieldset">
                <legend>Other Settings</legend>
                <div className="form-group">
                    <label htmlFor="security">Security:</label>
                    <input 
                        id="security" 
                        type="text" // Use text for same validation reason
                        value={security}
                        onChange={handleSecurityChange}
                        style={{width: '100px'}}
                    />
                </div>
                <div className="checkbox-group">
                    <input 
                        id="individualDesign" 
                        type="checkbox" 
                        checked={individualDesign} 
                        onChange={(e) => setIndividualDesign(e.target.checked)}
                    />
                    <label htmlFor="individualDesign">Individual Set Screen Design</label>
                </div>
                <div className="design-set-display">
                    No custom design set
                </div>
            </fieldset>
        </DraggableModal>
    );
};