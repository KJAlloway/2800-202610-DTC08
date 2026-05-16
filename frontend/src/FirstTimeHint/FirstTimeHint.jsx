import React from 'react';
import Button from '../TemplateButtons/Button';
import './FirstTimeHint.css';

const FirstTimeHint = ({ title, message, onDismiss }) => {
    return (
        <aside className="hint-card-outer">
            <div className="hint-card-inner">
                <div className="hint-header">
                    <h3 className="hint-title">{title}</h3>
                </div>

                <div className="hint-body">
                    <p className="hint-text">{message}</p>
                </div>

                <div className="hint-actions">
                    <Button 
                        text="Understood, disable this hint"
                        onClick={onDismiss}
                        className="hint-dismiss-button"
                    />
                </div>
            </div>
        </aside>
    );
};

export default FirstTimeHint;