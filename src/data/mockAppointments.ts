import type { Appointment } from "@/pages/Appointment/AppointmentModule";

const names = [
    "Priya Kumar", "Anitha Raj", "Meena Sundar", "Kavya Iyer", "Divya Prasad",
    "Manikandan", "Rohit Kumar", "Varun Kumar", "Rajesh Kannan", "Suresh Kumar",
    "Ganesh Babu", "Kavita Sharma", "Deepak Verma", "Lakshmi Narayanan", "Swetha Reddy",
    "Arun Prakash", "Vigneshwaran", "Ramachandran", "Bhavani Shankar", "Gayathri Devi",
    "Senthil Kumar", "Nandhini Gopal", "Karthik Subramanian", "Pooja Hegde", "Sanjay Dutt",
    "Radhika Sarath", "Manoj Prabhakar", "Ramesh Chandran", "Aishwarya Rai", "Vijay Sethupathi",
    "Surya Kumar", "Dhanush Raj", "Kamal Haasan", "Rajinikanth M", "Trisha Krishnan",
    "Nayanthara K", "Keerthy Suresh", "Samantha Ruth", "Rashmika Mandanna", "Anupama Parameswaran",
    "Nivetha Thomas", "Pravin Kumar", "Ashwin Raj", "Preethi Mohan", "Sowmya Murthy",
    "Balaji Srinivasan", "Gopalan Nair", "Indira Priyadarshini", "Jayaram V", "Krishna Prasad",
    "Latha Venkatesh", "Mahesh Babu", "Nageswara Rao", "Om Prakash", "Padma Subrahmanyam",
    "Raghavan Pillai", "Saravanan P", "Thangavelu K", "Uma Maheshwari", "Vasudevan R",
    "Yamuna Devi", "Zakir Hussain", "Abhinav Bindra", "Bhaskar Sharma", "Chitra Visweswaran",
    "Dinesh Karthik", "Elango K", "Farooq Ahmed", "Giri Prasad", "Hariharan S",
    "Iswarya R", "Jagadish Chandra", "Kannan M", "Logeshwaran T", "Muralidharan S",
    "Nirmala Sitaraman", "Prabhu Deva", "Qadir Khan", "Rukmini Devi", "Sundaram Iyer",
    "Tirupati Rao", "Udayakumar R", "Venkatesh Prasad", "Wilfred Dsouza", "Xavier Antony",
    "Yogeshwaran S", "Zubaida Begum", "Aravind Swami", "Bala Murali", "Chandran R",
    "Devan Nair", "Ezhil Raja", "Francis Xavier", "Gitanjali R", "Harish Raghavendra",
    "Ilango V", "Janaki Ram", "Kalpana Chawla", "Lokesh Kanagaraj", "Mani Ratnam"
];

const doctorsMap: Record<string, string[]> = {
    Gynecology: ["Dr. Madhumitha", "Dr. Subha"],
    Cardiology: ["Dr. Ravi", "Dr. Suresh"],
    Orthopedics: ["Dr. Ganesh", "Dr. Ramesh"],
    Dermatology: ["Dr. Anu", "Dr. Priya"],
};

const depts = ["Gynecology", "Cardiology", "Orthopedics", "Dermatology"];
const types: ("Online" | "Reception" | "Phone")[] = ["Online", "Reception", "Phone"];
const statuses: ("Upcoming" | "Visited" | "Cancelled")[] = ["Upcoming", "Visited", "Cancelled"];
const times = ["08:30 AM", "09:00 AM", "09:30 AM", "10:00 AM", "10:30 AM", "11:00 AM", "02:00 PM", "03:30 PM", "04:15 PM", "05:00 PM"];
const rawTimes = ["08:30", "09:00", "09:30", "10:00", "10:30", "11:00", "14:00", "15:30", "16:15", "17:00"];

export const mockAppointments: Appointment[] = Array.from({ length: 100 }, (_, index) => {
    const idNum = index + 1;
    const name = names[index % names.length];
    const dept = depts[index % depts.length];
    const doctorList = doctorsMap[dept];
    const doctor = doctorList[index % doctorList.length];
    const gender = (index % 2 === 0 || dept === "Gynecology") ? "Female" : "Male";
    const age = 20 + ((index * 7) % 55);
    const type = types[index % types.length];
    const status = statuses[index % statuses.length];
    const timeIdx = index % times.length;

    // Generate dates around August 2026
    const day = String((index % 28) + 1).padStart(2, "0");
    const month = String(((index % 3) + 6)).padStart(2, "0"); // 06, 07, 08
    const rawDate = `2026-${month}-${day}`;
    const apptOn = `${day}-${month}-2026 ${times[timeIdx]}`;
    const bookedOn = `01-${month}-2026 09:00 AM`;

    const apptNo = `APT-2026${month}${day}-${String(idNum).padStart(2, "0")}`;
    const uhid = `UH2026${String(10000 + idNum).padStart(5, "0")}`;
    const regNo = index % 3 === 0 ? `REG-${55000 + idNum}` : "–";
    const mobile = `98${String(10000000 + idNum * 837).slice(0, 8)}`;

    return {
        id: String(idNum),
        apptNo,
        patient: name,
        uhid,
        regNo,
        doctor,
        dept,
        apptOn,
        rawDate,
        rawTime: rawTimes[timeIdx],
        type,
        status,
        gender,
        age,
        mobile,
        bookedOn,
    };
});
