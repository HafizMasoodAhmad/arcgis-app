import React, { useState, useEffect, useRef } from 'react';
import './MultiSelect.css';

interface MultiSelectProps {
    id?: string;
    name?: string;
    options: { value: string, label: string }[];
    selectedValues?: string[];
    placeholder?: string;
    className?: string;
    onChange: (selectedValues: string[]) => void;
}

export const MultiSelect = ({ 
    id,
    name,
    options, 
    selectedValues = [],
    placeholder = "Select options...",
    className = "",
    onChange
}: MultiSelectProps) => {
    const [isOpen, setIsOpen] = useState(false);
    const [selected, setSelected] = useState<string[]>(selectedValues);
    const prevSelectedValuesRef = useRef<string[]>(selectedValues);
    const isInternalChangeRef = useRef(false);
    const formRef = useRef<HTMLFormElement | null>(null);

    // Find the form element when component mounts
    useEffect(() => {
        if (name) {
            const input = document.querySelector(`input[name="${name}"]`) as HTMLInputElement;
            if (input) {
                formRef.current = input.closest('form');
            }
        }
    }, [name]);

    // Listen for form reset events
    useEffect(() => {
        const form = formRef.current;
        if (!form) return;

        const handleFormReset = () => {
            isInternalChangeRef.current = true;
            setSelected([]);
        };

        form.addEventListener('reset', handleFormReset);

        return () => {
            form.removeEventListener('reset', handleFormReset);
        };
    }, []);

    // Update internal state when selectedValues prop changes
    useEffect(() => {
        // Only update if the selectedValues prop actually changed
        const prevValues = prevSelectedValuesRef.current;
        const currentValues = selectedValues || [];
        
        // Deep comparison to avoid unnecessary updates
        const hasChanged = prevValues.length !== currentValues.length || 
            prevValues.some((val, index) => val !== currentValues[index]);
        
        if (hasChanged) {
            setSelected([...currentValues]);
            prevSelectedValuesRef.current = [...currentValues];
        }
    }, [selectedValues]);

    // Call onChange when internal state changes (but not from external prop changes)
    useEffect(() => {
        if (isInternalChangeRef.current) {
            onChange(selected);
            isInternalChangeRef.current = false;
        }
    }, [selected, onChange]);

    const handleOptionClick = (value: string) => {
        const newSelected = selected.includes(value)
            ? selected.filter(item => item !== value)
            : [...selected, value];
        
        isInternalChangeRef.current = true;
        setSelected(newSelected);
    };

    const handleRemoveOption = (value: string, e: React.MouseEvent) => {
        e.stopPropagation();
        const newSelected = selected.filter(item => item !== value);
        
        isInternalChangeRef.current = true;
        setSelected(newSelected);
    };

    const handleClearAll = (e: React.MouseEvent) => {
        e.stopPropagation();
        isInternalChangeRef.current = true;
        setSelected([]);
        closeDropdown();
    };

    const getSelectedLabels = () => {
        return selected.map(value => 
            options.find(option => option.value === value)?.label || value
        );
    };

    const toggleDropdown = () => {
        setIsOpen(!isOpen);
    };

    const closeDropdown = () => {
        setIsOpen(false);
    };

    return (
        <div className="multi-select-container">
            {/* Hidden input for form submission */}
            {name && (
                <input
                    type="hidden"
                    name={name}
                    value={selected.join(',')}
                    id={id}
                />
            )}
            
            <div 
                className={`multi-select-input ${className}`}
                onClick={toggleDropdown}
            >
                {selected.length === 0 ? (
                    <span className="multi-select-placeholder">{placeholder}</span>
                ) : (
                    <>
                        {getSelectedLabels().map((label, index) => (
                            <span
                                key={index}
                                className="multi-select-chip"
                            >
                                {label}
                                <button
                                    type="button"
                                    onClick={(e) => handleRemoveOption(selected[index], e)}
                                    className="remove-btn"
                                >
                                    <i className="fa-solid fa-xmark"></i>
                                </button>
                            </span>
                        ))}
                    </>
                )}
            </div>

            {isOpen && (
                <div className="multi-select-dropdown">
                    {/* Clear All Button */}
                    {selected.length > 0 && (
                        <div className="multi-select-clear">
                            <button
                                type="button"
                                onClick={handleClearAll}
                                className="multi-select-clear-button"
                            >
                                <i className="fa-solid fa-xmark"></i> Unselect all ({selected.length})
                            </button>
                        </div>
                    )}

                    {/* Options List */}
                    {options.map((option) => (
                        <div
                            key={option.value}
                            onClick={() => handleOptionClick(option.value)}
                            className={`multi-select-option ${selected.includes(option.value) ? 'is-selected' : ''}`}
                        >
                            <input
                                type="checkbox"
                                checked={selected.includes(option.value)}
                                readOnly
                            />
                            {option.label}
                        </div>
                    ))}
                </div>
            )}

            {/* Overlay to close dropdown when clicking outside */}
            {isOpen && (
                <div className="multi-select-overlay" onClick={closeDropdown} />
            )}
        </div>
    );
};