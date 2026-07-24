import { Check, Pencil, X } from 'lucide-react';

type ProfileActionsProps = {
    isEditing: boolean;
    onEdit: () => void;
    onCancel: () => void;
    onSave: () => void;
    className: string;
    cancelClassName?: string;
    saveClassName?: string;
};

const ProfileActions = ({
    isEditing,
    onEdit,
    onCancel,
    onSave,
    className,
    cancelClassName = 'btn btn-secondary flex items-center gap-2',
    saveClassName = 'btn btn-primary flex items-center gap-2',
}: ProfileActionsProps) => (
    <div className={className}>
        {!isEditing ? (
            <button onClick={onEdit} className="btn btn-secondary flex items-center gap-2" type="button">
                <Pencil className="w-4 h-4" /> Edit
            </button>
        ) : (
            <>
                <button onClick={onCancel} className={cancelClassName} type="button">
                    <X className="w-4 h-4" />
                </button>
                <button onClick={onSave} className={saveClassName} type="button">
                    <Check className="w-4 h-4" />
                </button>
            </>
        )}
    </div>
);

export default ProfileActions;
