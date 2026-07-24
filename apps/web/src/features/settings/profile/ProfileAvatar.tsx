import { Upload } from 'lucide-react';
import type { ChangeEvent, RefObject } from 'react';

type ProfileAvatarProps = {
    inputRef: RefObject<HTMLInputElement | null>;
    avatarUrl: string | null;
    initials: string;
    onChange: (event: ChangeEvent<HTMLInputElement>) => void;
    onSelectFile: () => void;
};

const ProfileAvatar = ({ inputRef, avatarUrl, initials, onChange, onSelectFile }: ProfileAvatarProps) => (
    <>
        <input
            ref={inputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={onChange}
        />

        <button
            type="button"
            onClick={onSelectFile}
            title="Change profile photo"
            className="relative w-24 h-24 rounded-2xl shrink-0 group overflow-hidden border border-gray-100"
        >
            {avatarUrl ? (
                <img src={avatarUrl} alt="Profile" className="w-full h-full object-cover rounded-2xl" />
            ) : (
                <div className="w-full h-full bg-emerald-100 flex items-center justify-center text-emerald-700 text-lg font-bold rounded-2xl">
                    {initials}
                </div>
            )}
            <div className="absolute inset-0 bg-black/40 flex items-center justify-center rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity">
                <Upload className="w-4 h-4 text-white" />
            </div>
        </button>
    </>
);

export default ProfileAvatar;
