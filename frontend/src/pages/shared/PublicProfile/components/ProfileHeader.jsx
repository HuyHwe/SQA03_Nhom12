import { MapPin, Calendar, Github, Linkedin, Globe, Edit3 } from "lucide-react";

export default function ProfileHeader({ profile }) {
    return (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden mb-6">
            {/* Cover Image */}
            <div className="h-48 w-full bg-gray-200 relative">
                <img
                    src={profile.coverImage}
                    alt="Cover"
                    className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent"></div>
            </div>

            <div className="px-6 pb-6 relative">
                <div className="flex flex-col md:flex-row items-start md:items-end -mt-16 mb-4 gap-6">
                    {/* Avatar */}
                    <div className="relative">
                        <div className="w-32 h-32 rounded-full border-4 border-white shadow-lg overflow-hidden bg-white">
                            <img
                                src={profile.avatar}
                                alt={profile.fullName}
                                className="w-full h-full object-cover"
                            />
                        </div>
                        <div className="absolute bottom-2 right-2 w-6 h-6 bg-green-500 border-2 border-white rounded-full" title="Online"></div>
                    </div>

                    {/* Basic Info */}
                    <div className="flex-1 pt-2 md:pt-0 md:pb-2">
                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                            <div>
                                <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                                    {profile.fullName}
                                    <span className="px-2 py-0.5 rounded-full bg-blue-100 text-blue-700 text-xs font-semibold uppercase">
                                        {profile.role}
                                    </span>
                                </h1>
                                <p className="text-gray-500 font-medium">@{profile.username}</p>
                            </div>

                            <button className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg font-medium text-sm transition-colors flex items-center gap-2">
                                <Edit3 className="w-4 h-4" />
                                <span>Chỉnh sửa</span>
                            </button>
                        </div>
                    </div>
                </div>

                {/* Bio & Details */}
                <div className="space-y-4">
                    <p className="text-gray-700 leading-relaxed max-w-3xl">
                        {profile.bio}
                    </p>

                    <div className="flex flex-wrap items-center gap-y-2 gap-x-6 text-sm text-gray-600">
                        <div className="flex items-center gap-1.5">
                            <MapPin className="w-4 h-4 text-gray-400" />
                            <span>{profile.location}</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                            <Calendar className="w-4 h-4 text-gray-400" />
                            <span>{profile.joinDate}</span>
                        </div>

                        <div className="w-px h-4 bg-gray-300 hidden sm:block"></div>

                        <div className="flex items-center gap-3">
                            <a href={profile.socials.github} target="_blank" rel="noreferrer" className="text-gray-500 hover:text-gray-900 transition-colors">
                                <Github className="w-5 h-5" />
                            </a>
                            <a href={profile.socials.linkedin} target="_blank" rel="noreferrer" className="text-gray-500 hover:text-blue-700 transition-colors">
                                <Linkedin className="w-5 h-5" />
                            </a>
                            <a href={profile.socials.website} target="_blank" rel="noreferrer" className="text-gray-500 hover:text-blue-500 transition-colors">
                                <Globe className="w-5 h-5" />
                            </a>
                        </div>
                    </div>

                    {/* Badges */}
                    <div className="flex flex-wrap gap-2 pt-2">
                        {profile.badges.map(badge => (
                            <span
                                key={badge.id}
                                className={`px-3 py-1 rounded-full text-xs font-semibold flex items-center gap-1.5 ${badge.color}`}
                            >
                                <span>{badge.icon}</span>
                                {badge.name}
                            </span>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}
