// Mock data for contributors rankings
// Formula: Contribution Points = (publicQuestions × 2) + (blogPosts × 3)

const generateMockContributors = () => {
    const firstNames = [
        "Viblo", "Dao", "Nguyen", "Nghiem", "Ngo", "Hero", "Mai", "Tran",
        "Le", "Pham", "Hoang", "Vu", "Do", "Dang", "Bui", "Duong", "Ly",
        "Truong", "Phan", "Vo", "Ta", "Trinh", "Ngo", "Quach", "Dinh"
    ];

    const lastNames = [
        "Algorithm", "Quang Huy", "Hoang Linh", "Xuan Hien", "Van Thien",
        "Gustin", "Thanh Tung", "Minh Quan", "Anh Tuan", "Duc Manh",
        "Kim Chi", "Thu Ha", "Bao Long", "Khanh Linh", "Tien Dat",
        "Ngoc Mai", "Hai Dang", "Van Anh", "Thuy Linh", "Minh Chau",
        "Announcer", "Developer", "Coder", "Master", "Expert"
    ];

    const contributors = [];

    for (let i = 0; i < 103; i++) {
        const firstName = firstNames[Math.floor(Math.random() * firstNames.length)];
        const lastName = lastNames[Math.floor(Math.random() * lastNames.length)];
        const username = i < 10
            ? ["Viblo Algorithm", "Viblo Announcer", "Dao Quang Huy", "Nguyen Hoang Linh B", "Nghiem Xuan Hien", "Ngo Van Thien", "Hero Gustin", "Mai Thanh Tung", "Tran Minh Quan", "Le Anh Tuan"][i]
            : `${firstName} ${lastName}`;

        // Generate realistic statistics with variety
        const acceptedQuestions = i === 0 ? 0 : Math.floor(Math.random() * 50);
        const publicQuestions = i === 0 ? 17960 :
            i === 1 ? 7592 :
                i === 2 ? 2438 :
                    Math.floor(Math.random() * 5000) + (100 - i) * 20;
        const blogPosts = i === 0 ? 0 : Math.floor(Math.random() * 100);

        // Calculate contribution points using the formula
        const contributionPoints = (publicQuestions * 2) + (blogPosts * 3);

        contributors.push({
            id: i + 1,
            username,
            avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(username)}&background=random&size=128`,
            acceptedQuestions,
            publicQuestions,
            blogPosts,
            contributionPoints,
            // Total content contributed (for display)
            totalContributions: publicQuestions + blogPosts
        });
    }

    // Sort by contribution points (descending)
    contributors.sort((a, b) => b.contributionPoints - a.contributionPoints);

    // Reassign rank-based data for top 3 to match reference images
    if (contributors.length >= 3) {
        contributors[0] = {
            ...contributors[0],
            username: "Viblo Algorithm",
            contributionPoints: 77147,
            acceptedQuestions: 0,
            publicQuestions: 17960,
            blogPosts: 0,
            totalContributions: 17960,
            avatar: "https://ui-avatars.com/api/?name=Viblo+Algorithm&background=4F46E5&color=fff&size=128"
        };

        contributors[1] = {
            ...contributors[1],
            username: "Viblo Announcer",
            contributionPoints: 20478,
            acceptedQuestions: 0,
            publicQuestions: 7592,
            blogPosts: 0,
            totalContributions: 7592,
            avatar: "https://ui-avatars.com/api/?name=Viblo+Announcer&background=06B6D4&color=fff&size=128"
        };

        contributors[2] = {
            ...contributors[2],
            username: "Dao Quang Huy",
            contributionPoints: 18200,
            acceptedQuestions: 0,
            publicQuestions: 2438,
            blogPosts: 0,
            totalContributions: 2438,
            avatar: "https://ui-avatars.com/api/?name=Dao+Quang+Huy&background=1F2937&color=fff&size=128"
        };
    }

    return contributors;
};

export const mockContributors = generateMockContributors();

// Get top 3 contributors
export const getTopThree = () => mockContributors.slice(0, 3);

// Get paginated contributors (excluding top 3)
export const getPaginatedContributors = (page = 1, pageSize = 10) => {
    const startIndex = 3; // Skip top 3
    const allRemainingContributors = mockContributors.slice(startIndex);

    const start = (page - 1) * pageSize;
    const end = start + pageSize;

    return {
        data: allRemainingContributors.slice(start, end),
        totalPages: Math.ceil(allRemainingContributors.length / pageSize),
        currentPage: page,
        totalItems: allRemainingContributors.length,
        startRank: startIndex + start + 1, // +1 for 1-based ranking
    };
};
