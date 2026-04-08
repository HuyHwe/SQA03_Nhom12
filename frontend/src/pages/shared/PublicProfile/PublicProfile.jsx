import { useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import ProfileHeader from "./components/ProfileHeader";
import ProfileStats from "./components/ProfileStats";
import ActivityTabs from "./components/ActivityTabs";
import { getProfileById, getProfileActivity } from "./data/mockProfileData";

export default function PublicProfile() {
    const { id } = useParams();
    const [profile, setProfile] = useState(null);
    const [activity, setActivity] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Simulate API fetch
        setLoading(true);
        setTimeout(() => {
            const data = getProfileById(id);
            const activityData = getProfileActivity(id);
            setProfile(data);
            setActivity(activityData);
            setLoading(false);
        }, 500);
    }, [id]);

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
        );
    }

    if (!profile) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center">
                    <h2 className="text-2xl font-bold text-gray-900">Không tìm thấy người dùng</h2>
                    <p className="text-gray-500 mt-2">Người dùng này không tồn tại hoặc đã bị khóa.</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 py-8">
            <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
                <ProfileHeader profile={profile} />
                <ProfileStats stats={profile.stats} />
                <ActivityTabs activity={activity} skills={profile.skills} />
            </div>
        </div>
    );
}
