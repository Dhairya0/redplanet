import axios from 'axios';

const API_BASE_URL = 'http://localhost:3000';
interface Shift {
    id: string;
    workplaceId: string;
}

interface Workplace {
    id: string;
    name: string;
}

async function getTopWorkplaces() {
    try {
        console.log('Fetching shifts from API...');

        const shiftsResponse = await axios.get(`${API_BASE_URL}/shifts`);
        console.log("Full API Response:", JSON.stringify(shiftsResponse.data, null, 2));

        const shifts = shiftsResponse.data?.data || shiftsResponse.data;
        console.log("Extracted Shifts:", shifts);
        console.log(`Total shifts found: ${shifts.length}`);

        if (!shifts || shifts.length === 0) {
            console.log('No shifts found.');
            return;
        }

        console.log(`Retrieved ${shifts.length} shifts. Processing data...`);

        const workplaceShiftCount: Record<string, number> = {};
        for (const shift of shifts) {
            workplaceShiftCount[shift.workplaceId] = (workplaceShiftCount[shift.workplaceId] || 0) + 1;
        }

        const sortedWorkplaces = Object.entries(workplaceShiftCount)
            .sort((a, b) => b[1] - a[1])
            .slice(0, 3);

        if (sortedWorkplaces.length === 0) {
            console.log('No active workplaces found.');
            return;
        }

        console.log('Fetching workplace details...');

        const topWorkplaces: { name: string; shifts: number }[] = [];
        for (const [workplaceId, shiftCount] of sortedWorkplaces) {
            try {
                const workplaceResponse = await axios.get(`${API_BASE_URL}/workplaces/${workplaceId}`);
                const workplace = workplaceResponse.data?.data || workplaceResponse.data; 

                console.log(`Fetched workplace ${workplaceId}:`, workplace); 

                if (workplace && workplace.name) {
                    topWorkplaces.push({
                        name: workplace.name,
                        shifts: shiftCount,
                    });
                } else {
                    console.warn(`Workplace ${workplaceId} is missing a name. Skipping...`);
                }
            } catch (error) {
                console.error(`Failed to fetch workplace details for ID ${workplaceId}:`, error);
            }
        }

        console.log('Top workplaces:');
        console.log(JSON.stringify(topWorkplaces, null, 2));

    } catch (error: unknown) {
        if (axios.isAxiosError(error)) {
            console.error('Axios error:', error.response?.data || error.message);
        } else if (error instanceof Error) {
            console.error('Unexpected error:', error.message);
        } else {
            console.error('An unknown error occurred:', JSON.stringify(error, null, 2));
        }
    }
}

getTopWorkplaces();
