// MentorDashboard.tsx (full modules with Firestore)
import React, { useEffect, useState } from 'react';
import { User, BookOpen, BarChart3, Briefcase, HelpCircle, Search, Plus, X, GraduationCap, CheckCircle } from 'lucide-react';
import { db } from './firebase';
import { collection, onSnapshot, addDoc, updateDoc, doc } from 'firebase/firestore';

type Subject = { name: string; chapters: number; completed?: number };

type Student = {
	id: string;
	name: string;
	grade: string;
	board: string;
	batch: string;
	timeSlot?: string;
	school?: string;
	subjects?: Subject[];
	doubts?: { open: number; resolved: number };
};

type WorkItem = { id: string; studentId: string; title: string; description?: string; status: 'pending' | 'completed' };

type Doubt = { id: string; studentId: string; question: string; resolved: boolean };

const StudentDirectory = ({
	students,
	setStudents,
	filters,
	setFilters,
}: {
	students: Student[];
	setStudents: React.Dispatch<React.SetStateAction<Student[]>>;
	filters: { search: string; board: string; grade: string; batch: string } & Record<string, string>;
	setFilters: React.Dispatch<React.SetStateAction<any>>;
}) => {
	const [showAddStudent, setShowAddStudent] = useState(false);
	const [addStudentForm, setAddStudentForm] = useState<{ name: string; grade: string; board: string; batch: string; contact?: string; school?: string }>({ name: '', grade: '', board: '', batch: '' });

	const getTimeSlot = (batch: string) => (batch === 'A' ? '3:00-4:30' : batch === 'B' ? '4:30-6:00' : batch === 'C' ? '6:00-8:00' : '');

	const filteredStudents = students.filter(student => (
		(!filters.search || student.name.toLowerCase().includes(filters.search.toLowerCase())) &&
		(!filters.board || student.board === filters.board) &&
		(!filters.grade || student.grade === filters.grade) &&
		(!filters.batch || student.batch === filters.batch)
	));

	return (
		<div className="space-y-6">
			<div className="flex justify-between items-center">
				<div>
					<h2 className="text-2xl font-bold text-gray-800">Student Directory</h2>
					<p className="text-gray-600">Manage student information and contact details</p>
				</div>
				<button onClick={() => setShowAddStudent(true)} className="bg-blue-500 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-blue-600">
					<Plus className="w-4 h-4" /> Add Student
				</button>
			</div>

			<div className="bg-white p-4 rounded-lg shadow-sm border grid grid-cols-1 md:grid-cols-5 gap-4">
				<div className="relative md:col-span-2">
					<Search className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
					<input className="w-full pl-10 pr-4 py-2 border rounded-lg" placeholder="Search by Name" value={filters.search} onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))} />
				</div>
				<select className="px-4 py-2 border rounded-lg" value={filters.board} onChange={(e) => setFilters(prev => ({ ...prev, board: e.target.value }))}>
					<option value="">Board</option>
					<option>CBSE</option>
					<option>ICSE</option>
					<option>Cambridge</option>
					<option>GSEB</option>
				</select>
				<select className="px-4 py-2 border rounded-lg" value={filters.grade} onChange={(e) => setFilters(prev => ({ ...prev, grade: e.target.value }))}>
					<option value="">Grade</option>
					<option>8</option>
					<option>9</option>
					<option>10</option>
					<option>11</option>
					<option>12</option>
				</select>
				<select className="px-4 py-2 border rounded-lg" value={filters.batch} onChange={(e) => setFilters(prev => ({ ...prev, batch: e.target.value }))}>
					<option value="">Batch</option>
					<option>A</option>
					<option>B</option>
					<option>C</option>
				</select>
				<button onClick={() => setFilters(prev => ({ ...prev, search: '', board: '', grade: '', batch: '' }))} className="px-4 py-2 border rounded-lg hover:bg-gray-50">Clear</button>
			</div>

			<div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
				{filteredStudents.map((s) => (
					<div key={s.id} className="bg-white rounded-lg shadow-sm border p-4">
						<div className="flex items-start gap-3">
							<div className="w-12 h-12 bg-gray-200 rounded-full flex items-center justify-center">
								<User className="w-6 h-6 text-gray-600" />
							</div>
							<div className="flex-1">
								<h3 className="font-semibold text-gray-800">{s.name}</h3>
								<p className="text-sm text-gray-600">Grade {s.grade} • {s.board}</p>
								<p className="text-sm text-gray-600">{s.batch}{s.timeSlot ? ` • ${s.timeSlot}` : ''}</p>
							</div>
						</div>
					</div>
				))}
			</div>

			{showAddStudent && (
				<div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
					<div className="bg-white rounded-lg p-6 w-full max-w-md">
						<div className="flex justify-between items-center mb-4">
							<h3 className="text-lg font-semibold">Add New Student</h3>
							<button onClick={() => setShowAddStudent(false)}><X className="w-5 h-5" /></button>
						</div>
						<form className="space-y-4" onSubmit={async (e) => {
							e.preventDefault();
							if (!addStudentForm.name.trim()) return;
							const payload = {
								name: addStudentForm.name,
								grade: addStudentForm.grade,
								board: addStudentForm.board,
								batch: addStudentForm.batch,
								timeSlot: getTimeSlot(addStudentForm.batch),
								subjects: [] as Subject[],
								doubts: { open: 0, resolved: 0 },
							};
							await addDoc(collection(db, 'students'), payload);
							setAddStudentForm({ name: '', grade: '', board: '', batch: '' });
							setShowAddStudent(false);
						}}>
							<input className="w-full p-3 border rounded-lg" placeholder="Student Name" value={addStudentForm.name} onChange={e => setAddStudentForm(prev => ({ ...prev, name: e.target.value }))} required />
							<select className="w-full p-3 border rounded-lg" value={addStudentForm.grade} onChange={e => setAddStudentForm(prev => ({ ...prev, grade: e.target.value }))}>
								<option value="">Select Grade</option>
								<option>8</option><option>9</option><option>10</option><option>11</option><option>12</option>
							</select>
							<select className="w-full p-3 border rounded-lg" value={addStudentForm.board} onChange={e => setAddStudentForm(prev => ({ ...prev, board: e.target.value }))}>
								<option value="">Select Board</option>
								<option>CBSE</option><option>ICSE</option><option>Cambridge</option><option>GSEB</option>
							</select>
							<select className="w-full p-3 border rounded-lg" value={addStudentForm.batch} onChange={e => setAddStudentForm(prev => ({ ...prev, batch: e.target.value }))}>
								<option value="">Select Batch</option>
								<option>A</option><option>B</option><option>C</option>
							</select>
							<div className="flex gap-2">
								<button type="button" className="flex-1 px-4 py-2 border rounded-lg" onClick={() => setShowAddStudent(false)}>Cancel</button>
								<button type="submit" className="flex-1 px-4 py-2 bg-blue-500 text-white rounded-lg">Add</button>
							</div>
						</form>
					</div>
				</div>
			)}
		</div>
	);
};

const SubjectManager = ({
	students,
	setStudents,
	filters,
	setFilters,
}: {
	students: Student[];
	setStudents: React.Dispatch<React.SetStateAction<Student[]>>;
	filters: { search: string; board: string; grade: string; batch: string } & Record<string, string>;
	setFilters: React.Dispatch<React.SetStateAction<any>>;
}) => {
	const [selectedStudent, setSelectedStudent] = useState<string | null>(null);
	const [showAddSubjectModal, setShowAddSubjectModal] = useState(false);
	const [subjectForm, setSubjectForm] = useState<{ name: string; chapters: string }>({ name: '', chapters: '' });

	const handleAddSubject = async (studentId: string | null) => {
		if (!studentId || !subjectForm.name.trim() || !subjectForm.chapters) return;
		const student = students.find(s => s.id === studentId);
		if (!student) return;
		const updatedSubjects = [
			...(student.subjects || []),
			{ name: subjectForm.name, chapters: parseInt(subjectForm.chapters, 10) || 0, completed: 0 },
		];
		await updateDoc(doc(db, 'students', studentId), { subjects: updatedSubjects });
		setSubjectForm({ name: '', chapters: '' });
		setSelectedStudent(null);
		setShowAddSubjectModal(false);
	};

	const filteredStudents = students.filter(student => (
		(!filters.search || student.name.toLowerCase().includes(filters.search.toLowerCase())) &&
		(!filters.board || student.board === filters.board) &&
		(!filters.grade || student.grade === filters.grade) &&
		(!filters.batch || student.batch === filters.batch)
	));

	return (
		<div className="space-y-6">
			<div>
				<h2 className="text-2xl font-bold text-gray-800">Subject Manager</h2>
				<p className="text-gray-600">Assign subjects and manage curriculum for each student</p>
			</div>

			<div className="bg-white p-4 rounded-lg shadow-sm border grid grid-cols-1 md:grid-cols-4 gap-4">
				<div className="relative">
					<Search className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
					<input className="w-full pl-10 pr-4 py-2 border rounded-lg" placeholder="Search by Name" value={filters.search} onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))} />
				</div>
				<select className="px-4 py-2 border rounded-lg" value={filters.board} onChange={(e) => setFilters(prev => ({ ...prev, board: e.target.value }))}>
					<option value="">Select Board</option>
					<option>CBSE</option><option>ICSE</option><option>Cambridge</option><option>GSEB</option>
				</select>
				<select className="px-4 py-2 border rounded-lg" value={filters.grade} onChange={(e) => setFilters(prev => ({ ...prev, grade: e.target.value }))}>
					<option value="">Select Grade</option>
					<option>8</option><option>9</option><option>10</option><option>11</option><option>12</option>
				</select>
				<select className="px-4 py-2 border rounded-lg" value={filters.batch} onChange={(e) => setFilters(prev => ({ ...prev, batch: e.target.value }))}>
					<option value="">Select Batch</option>
					<option>A</option><option>B</option><option>C</option>
				</select>
			</div>

			<div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
				{filteredStudents.map((student) => (
					<div key={student.id} className="bg-white rounded-lg shadow-sm border p-4">
						<div className="flex items-start gap-3 mb-4">
							<div className="w-12 h-12 bg-gray-200 rounded-full flex items-center justify-center">
								<User className="w-6 h-6 text-gray-600" />
							</div>
							<div className="flex-1">
								<h3 className="font-semibold text-gray-800">{student.name}</h3>
								<p className="text-sm text-gray-600">Grade {student.grade} • {student.board}</p>
								<p className="text-sm text-gray-600">{student.batch}{student.timeSlot ? ` • ${student.timeSlot}` : ''}</p>
							</div>
						</div>

						<div className="space-y-2 mb-4">
							<h4 className="text-sm font-medium text-gray-700">Assigned Subjects:</h4>
							{(student.subjects || []).length > 0 ? (
								<div className="space-y-1">
									{student.subjects!.map((subject, index) => (
										<div key={index} className="flex justify-between items-center p-2 bg-gray-50 rounded text-sm">
											<span className="font-medium">{subject.name}</span>
											<span className="text-gray-600">{subject.chapters} chapters</span>
										</div>
									))}
								</div>
							) : (
								<p className="text-sm text-gray-500 italic">No subjects assigned</p>
							)}
						</div>

						<button onClick={() => { setSelectedStudent(student.id); setShowAddSubjectModal(true); }} className="w-full px-3 py-2 bg-blue-500 text-white text-sm rounded-lg hover:bg-blue-600 flex items-center justify-center gap-2">
							<Plus className="w-4 h-4" /> Add Subject
						</button>
					</div>
				))}
			</div>

			{showAddSubjectModal && (
				<div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
					<div className="bg-white rounded-lg p-6 w-full max-w-md">
						<div className="flex justify-between items-center mb-4">
							<h3 className="text-lg font-semibold">Add Subject</h3>
							<button onClick={() => { setShowAddSubjectModal(false); setSelectedStudent(null); setSubjectForm({ name: '', chapters: '' }); }}><X className="w-5 h-5" /></button>
						</div>
						<form onSubmit={async (e) => { e.preventDefault(); await handleAddSubject(selectedStudent); }} className="space-y-4">
							<div>
								<label className="block text-sm font-medium text-gray-700 mb-1">Subject Name</label>
								<select className="w-full p-3 border rounded-lg" value={subjectForm.name} onChange={(e) => setSubjectForm(prev => ({ ...prev, name: e.target.value }))} required>
									<option value="">Select Subject</option>
									<option>Mathematics</option><option>Science</option><option>English</option><option>Physics</option>
								</select>
							</div>
							<div>
								<label className="block text-sm font-medium text-gray-700 mb-1">Total Chapters</label>
								<input type="number" min={1} max={50} className="w-full p-3 border rounded-lg" placeholder="e.g. 15" value={subjectForm.chapters} onChange={(e) => setSubjectForm(prev => ({ ...prev, chapters: e.target.value }))} required />
							</div>
							<div className="flex gap-2">
								<button type="button" className="flex-1 px-4 py-2 border rounded-lg hover:bg-gray-50" onClick={() => { setShowAddSubjectModal(false); setSelectedStudent(null); setSubjectForm({ name: '', chapters: '' }); }}>Cancel</button>
								<button type="submit" className="flex-1 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600">Add Subject</button>
							</div>
						</form>
					</div>
				</div>
			)}
		</div>
	);
};

const SyllabusProgress = ({ students, filters, setFilters }: { students: Student[]; filters: any; setFilters: React.Dispatch<React.SetStateAction<any>> }) => {
	const filtered = students.filter(student => (
		(!filters.search || (student.name || '').toLowerCase().includes(filters.search.toLowerCase())) &&
		(!filters.board || student.board === filters.board) &&
		(!filters.grade || student.grade === filters.grade) &&
		(!filters.subject || (student.subjects || []).some(s => s.name === filters.subject))
	));

	return (
		<div className="space-y-6">
			<div>
				<h2 className="text-2xl font-bold text-gray-800">Syllabus Progress</h2>
				<p className="text-gray-600">Track academic progress for each student</p>
			</div>

			<div className="bg-white p-4 rounded-lg shadow-sm border grid grid-cols-1 md:grid-cols-4 gap-4">
				<div className="relative">
					<Search className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
					<input className="w-full pl-10 pr-4 py-2 border rounded-lg" placeholder="Search by Name" value={filters.search} onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))} />
				</div>
				<select className="px-4 py-2 border rounded-lg" value={filters.board} onChange={(e) => setFilters(prev => ({ ...prev, board: e.target.value }))}>
					<option value="">Board</option>
					<option>CBSE</option><option>ICSE</option><option>Cambridge</option><option>GSEB</option>
				</select>
				<select className="px-4 py-2 border rounded-lg" value={filters.grade} onChange={(e) => setFilters(prev => ({ ...prev, grade: e.target.value }))}>
					<option value="">Grade</option>
					<option>8</option><option>9</option><option>10</option><option>11</option><option>12</option>
				</select>
				<select className="px-4 py-2 border rounded-lg" value={filters.subject} onChange={(e) => setFilters(prev => ({ ...prev, subject: e.target.value }))}>
					<option value="">Subject</option>
					<option>Mathematics</option><option>Science</option><option>English</option><option>Physics</option>
				</select>
			</div>

			<div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
				{filtered.map((student) => (
					<div key={student.id} className="bg-white rounded-lg shadow-sm border p-4">
						<div className="flex items-start gap-3 mb-4">
							<div className="w-12 h-12 bg-gray-200 rounded-full flex items-center justify-center">
								<User className="w-6 h-6 text-gray-600" />
							</div>
							<div className="flex-1">
								<h3 className="font-semibold text-gray-800">{student.name}</h3>
								<p className="text-sm text-gray-600">Grade {student.grade} • {student.board}</p>
							</div>
						</div>
						<div className="space-y-2">
							{(student.subjects || []).map((subject, idx) => (
								<div key={idx} className="text-sm">
									<div className="flex justify-between">
										<span className="font-medium">{subject.name}</span>
										<span className="text-gray-600">{subject.completed ?? 0}/{subject.chapters} done</span>
									</div>
									<div className="w-full h-2 bg-gray-200 rounded mt-1">
										<div className="h-2 bg-blue-500 rounded" style={{ width: `${Math.min(100, Math.round(((subject.completed ?? 0) / Math.max(1, subject.chapters)) * 100))}%` }} />
									</div>
								</div>
							))}
							{(student.subjects || []).length === 0 && <p className="text-sm text-gray-500 italic">No subjects assigned</p>}
						</div>
					</div>
				))}
			</div>
		</div>
	);
};

const WorkPoolComponent = ({ students, workPool, setWorkPool }: { students: Student[]; workPool: WorkItem[]; setWorkPool: React.Dispatch<React.SetStateAction<WorkItem[]>> }) => {
	const [showAddWorkModal, setShowAddWorkModal] = useState(false);
	const [addWorkForm, setAddWorkForm] = useState<{ studentId: string; title: string; description: string }>({ studentId: '', title: '', description: '' });

	const handleAddWork = async () => {
		if (!addWorkForm.studentId || !addWorkForm.title.trim()) return;
		await addDoc(collection(db, 'workPool'), { studentId: addWorkForm.studentId, title: addWorkForm.title, description: addWorkForm.description, status: 'pending' });
		setAddWorkForm({ studentId: '', title: '', description: '' });
		setShowAddWorkModal(false);
	};

	const handleCompleteWork = async (id: string) => {
		await updateDoc(doc(db, 'workPool', id), { status: 'completed' });
	};

	return (
		<div className="space-y-6">
			<div className="flex justify-between items-center">
				<div>
					<h2 className="text-2xl font-bold text-gray-800">Work Pool</h2>
					<p className="text-gray-600">Create and manage student assignments and tasks</p>
				</div>
				<button className="bg-blue-500 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-blue-600" onClick={() => setShowAddWorkModal(true)}>
					<Plus className="w-4 h-4" /> Add Work
				</button>
			</div>

			<div className="grid grid-cols-1 md:grid-cols-4 gap-4">
				<div className="bg-white p-4 rounded-lg shadow-sm border">
					<p className="text-sm text-gray-600">Total</p>
					<p className="text-2xl font-bold">{workPool.length}</p>
				</div>
				<div className="bg-white p-4 rounded-lg shadow-sm border">
					<p className="text-sm text-gray-600">Pending</p>
					<p className="text-2xl font-bold">{workPool.filter(w => w.status !== 'completed').length}</p>
				</div>
				<div className="bg-white p-4 rounded-lg shadow-sm border">
					<p className="text-sm text-gray-600">Completed</p>
					<p className="text-2xl font-bold">{workPool.filter(w => w.status === 'completed').length}</p>
				</div>
				<div className="bg-white p-4 rounded-lg shadow-sm border">
					<p className="text-sm text-gray-600">Completion %</p>
					<p className="text-2xl font-bold">{workPool.length === 0 ? '0%' : `${Math.round((workPool.filter(w => w.status === 'completed').length / workPool.length) * 100)}%`}</p>
				</div>
			</div>

			<div className="space-y-3">
				{workPool.length === 0 ? (
					<div className="bg-white rounded-lg shadow-sm border p-12 text-center text-gray-500">No work yet</div>
				) : (
					workPool.map(task => {
						const student = students.find(s => s.id === task.studentId);
						return (
							<div key={task.id} className="bg-white p-4 rounded-lg border flex justify-between items-center">
								<div>
									<h4 className="font-semibold">{task.title}</h4>
									<p className="text-sm text-gray-600">{task.description}</p>
									<p className="text-sm text-gray-500">{student ? `Student: ${student.name}` : 'Unknown student'}</p>
								</div>
								{task.status === 'pending' ? (
									<button className="px-3 py-1 bg-green-500 text-white rounded" onClick={() => handleCompleteWork(task.id)}>Complete</button>
								) : (
									<CheckCircle className="w-5 h-5 text-green-600" />
								)}
							</div>
						);
					})
				)}
			</div>

			{showAddWorkModal && (
				<div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
					<div className="bg-white rounded-lg p-6 w-full max-w-md">
						<div className="flex justify-between items-center mb-4">
							<h3 className="text-lg font-semibold">Add Work</h3>
							<button onClick={() => setShowAddWorkModal(false)}><X className="w-5 h-5" /></button>
						</div>
						<div className="space-y-4">
							<select className="w-full p-3 border rounded-lg" value={addWorkForm.studentId} onChange={e => setAddWorkForm(prev => ({ ...prev, studentId: e.target.value }))}>
								<option value="">Select Student</option>
								{students.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
							</select>
							<input className="w-full p-3 border rounded-lg" placeholder="Task Title" value={addWorkForm.title} onChange={e => setAddWorkForm(prev => ({ ...prev, title: e.target.value }))} />
							<textarea className="w-full p-3 border rounded-lg" placeholder="Description" value={addWorkForm.description} onChange={e => setAddWorkForm(prev => ({ ...prev, description: e.target.value }))} />
							<div className="flex gap-2">
								<button className="flex-1 px-4 py-2 border rounded-lg" onClick={() => setShowAddWorkModal(false)}>Cancel</button>
								<button className="flex-1 px-4 py-2 bg-blue-500 text-white rounded-lg" onClick={handleAddWork}>Add Work</button>
							</div>
						</div>
					</div>
				</div>
			)}
		</div>
	);
};

const DoubtBox = ({ students, doubts, setDoubts }: { students: Student[]; doubts: Doubt[]; setDoubts: React.Dispatch<React.SetStateAction<Doubt[]>> }) => {
	const [showAddDoubtModal, setShowAddDoubtModal] = useState(false);
	const [addDoubtForm, setAddDoubtForm] = useState<{ studentId: string; question: string }>({ studentId: '', question: '' });

	return (
		<div className="space-y-6">
			<div>
				<h2 className="text-2xl font-bold text-gray-800">Doubt Box</h2>
				<p className="text-gray-600">Track and resolve student doubts. Click on a student to view their doubt history, or add a new one.</p>
			</div>

			{/* Filters */}
			<div className="bg-white p-4 rounded-lg shadow-sm border grid grid-cols-1 md:grid-cols-6 gap-4">
				<div className="relative">
					<Search className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
					<input className="w-full pl-10 pr-4 py-2 border rounded-lg" placeholder="e.g. Priya Patel" />
				</div>
				<select className="px-4 py-2 border rounded-lg">
					<option>Select Subject</option>
					<option>Mathematics</option>
					<option>Science</option>
					<option>English</option>
					<option>Physics</option>
				</select>
				<select className="px-4 py-2 border rounded-lg">
					<option>Select Priority</option>
					<option>High</option>
					<option>Medium</option>
					<option>Low</option>
				</select>
				<select className="px-4 py-2 border rounded-lg">
					<option>Select Status</option>
					<option>Open</option>
					<option>Tasked</option>
					<option>Resolved</option>
				</select>
				<select className="px-4 py-2 border rounded-lg">
					<option>Select Board</option>
					<option>CBSE</option>
					<option>ICSE</option>
					<option>Cambridge</option>
					<option>GSEB</option>
				</select>
				<select className="px-4 py-2 border rounded-lg">
					<option>Select Grade</option>
					<option>8</option>
					<option>9</option>
					<option>10</option>
					<option>11</option>
					<option>12</option>
				</select>
				<button className="px-4 py-2 border rounded-lg hover:bg-gray-50" onClick={() => setShowAddDoubtModal(true)}>Add Doubt</button>
			</div>

			{/* Doubt Activity Chart */}
			<div className="bg-white p-6 rounded-lg shadow-sm border">
				<h3 className="text-lg font-semibold mb-4">Doubt Activity – Last 30 Days</h3>
				<div className="h-64 flex items-end justify-between gap-1">
					{Array.from({ length: 30 }, (_, i) => {
						const v = Math.floor(Math.random() * 5);
						return (
							<div key={i} className="flex flex-col items-center gap-1 flex-1">
								<div className="w-full bg-blue-500 rounded-t" style={{ height: `${Math.max(v * 20, 4)}px` }}></div>
								<span className="text-xs text-gray-600 transform -rotate-45 origin-left">{new Date(Date.now() - (29 - i) * 86400000).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</span>
							</div>
						);
					})}
				</div>
			</div>

			{/* Archived Toggle & Views */}
			<div className="flex items-center justify-between">
				<div className="flex items-center gap-2">
					<input type="checkbox" id="archived-doubts" />
					<label htmlFor="archived-doubts" className="text-sm text-gray-600">Show Archived Students</label>
				</div>
				<div className="flex gap-2">
					<button className="px-4 py-2 border rounded-lg flex items-center gap-2">
						<div className="grid grid-cols-2 gap-1">
							<div className="w-2 h-2 bg-gray-400 rounded-sm"></div>
							<div className="w-2 h-2 bg-gray-400 rounded-sm"></div>
							<div className="w-2 h-2 bg-gray-400 rounded-sm"></div>
							<div className="w-2 h-2 bg-gray-400 rounded-sm"></div>
						</div>
						Cards View
					</button>
					<button className="px-4 py-2 border rounded-lg flex items-center gap-2">
						<div className="space-y-1">
							<div className="w-4 h-0.5 bg-gray-400"></div>
							<div className="w-4 h-0.5 bg-gray-400"></div>
							<div className="w-4 h-0.5 bg-gray-400"></div>
						</div>
						Table View
					</button>
				</div>
			</div>

			{/* Students Doubt Cards */}
			<div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
				{students.map((student) => (
					<div key={student.id} className="bg-white rounded-lg shadow-sm border p-4">
						<div className="flex items-start gap-3 mb-4">
							<div className="w-12 h-12 bg-gray-200 rounded-full flex items-center justify-center">
								<User className="w-6 h-6 text-gray-600" />
							</div>
							<div className="flex-1">
								<h3 className="font-semibold text-gray-800">{student.name}</h3>
								<p className="text-sm text-gray-600">Grade {student.grade} • {student.board}</p>
								<p className="text-sm text-gray-600">{student.school}</p>
							</div>
						</div>

						<div className="flex items-center gap-4 text-sm mb-4">
							<div className="flex items-center gap-1">
								<div className="w-3 h-3 bg-red-500 rounded-full"></div>
								<span>Open: {student.doubts?.open ?? 0}</span>
							</div>
							<div className="flex items-center gap-1">
								<div className="w-3 h-3 bg-green-500 rounded-full"></div>
								<span>Resolved: {student.doubts?.resolved ?? 0}</span>
							</div>
						</div>

						<div className="text-center py-4 text-gray-500">
							<p className="text-sm">No doubts logged yet</p>
						</div>
					</div>
				))}
			</div>

			{/* Add Doubt Modal */}
			{showAddDoubtModal && (
				<div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
					<div className="bg-white rounded-lg p-6 w-full max-w-md">
						<div className="flex justify-between items-center mb-4">
							<h3 className="text-lg font-semibold">Add Doubt</h3>
							<button onClick={() => setShowAddDoubtModal(false)}><X className="w-5 h-5" /></button>
						</div>
						<div className="space-y-4">
							<select className="w-full p-3 border rounded-lg" value={addDoubtForm.studentId} onChange={e => setAddDoubtForm(prev => ({ ...prev, studentId: e.target.value }))}>
								<option value="">Select Student</option>
								{students.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
							</select>
							<textarea className="w-full p-3 border rounded-lg" placeholder="Question" value={addDoubtForm.question} onChange={e => setAddDoubtForm(prev => ({ ...prev, question: e.target.value }))} />
							<div className="flex gap-2">
								<button className="flex-1 px-4 py-2 border rounded-lg" onClick={() => setShowAddDoubtModal(false)}>Cancel</button>
								<button className="flex-1 px-4 py-2 bg-blue-500 text-white rounded-lg" onClick={async () => {
									if (!addDoubtForm.studentId || !addDoubtForm.question.trim()) return;
									await addDoc(collection(db, 'doubts'), { studentId: addDoubtForm.studentId, question: addDoubtForm.question, resolved: false });
									setAddDoubtForm({ studentId: '', question: '' });
									setShowAddDoubtModal(false);
								}}>Add Doubt</button>
							</div>
						</div>
					</div>
				</div>
			)}
		</div>
	);
};

const MentorDashboard = () => {
	const [activeModule, setActiveModule] = useState<'student-directory' | 'subject-manager' | 'syllabus-progress' | 'work-pool' | 'doubt-box'>('subject-manager');
	const [students, setStudents] = useState<Student[]>([]);
	const [filters, setFilters] = useState({ search: '', board: '', grade: '', batch: '', subject: '', priority: '', status: '' });
	const [workPool, setWorkPool] = useState<WorkItem[]>([]);
	const [doubts, setDoubts] = useState<Doubt[]>([]);

	useEffect(() => {
		const unsubStudents = onSnapshot(collection(db, 'students'), (snap) => {
			setStudents(snap.docs.map(d => ({ id: d.id, ...(d.data() as Omit<Student, 'id'>) })));
		});
		const unsubWork = onSnapshot(collection(db, 'workPool'), (snap) => {
			setWorkPool(snap.docs.map(d => ({ id: d.id, ...(d.data() as Omit<WorkItem, 'id'>) })));
		});
		const unsubDoubts = onSnapshot(collection(db, 'doubts'), (snap) => {
			setDoubts(snap.docs.map(d => ({ id: d.id, ...(d.data() as Omit<Doubt, 'id'>) })));
		});
		return () => { unsubStudents(); unsubWork(); unsubDoubts(); };
	}, []);

	const Navigation = () => {
		const menuItems: Array<{ id: typeof activeModule; icon: any; label: string; color: string }> = [
			{ id: 'student-directory', icon: User, label: 'Student Directory', color: 'blue' },
			{ id: 'subject-manager', icon: BookOpen, label: 'Subject Manager', color: 'green' },
			{ id: 'syllabus-progress', icon: BarChart3, label: 'Syllabus Progress', color: 'purple' },
			{ id: 'work-pool', icon: Briefcase, label: 'Work Pool', color: 'orange' },
			{ id: 'doubt-box', icon: HelpCircle, label: 'Doubt Box', color: 'red' },
		];

		return (
			<div className="w-64 bg-white shadow-lg border-r min-h-screen">
				<div className="p-6 border-b">
					<div className="flex items-center gap-3">
						<div className="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center">
							<GraduationCap className="w-5 h-5 text-white" />
						</div>
						<div>
							<h1 className="text-lg font-bold text-gray-800">SHREEJI</h1>
							<p className="text-xs text-gray-500">Education zone - Power Pack</p>
						</div>
					</div>
				</div>
				<nav className="p-4">
					<ul className="space-y-2">
						{menuItems.map((item) => {
							const Icon = item.icon;
							const isActive = activeModule === item.id;
							return (
								<li key={item.id}>
									<button onClick={() => setActiveModule(item.id)} className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-left transition-colors ${isActive ? `bg-${item.color}-50 text-${item.color}-600` : 'text-gray-600 hover:bg-gray-50'}`}>
										<Icon className="w-5 h-5" />
										<span className="font-medium">{item.label}</span>
									</button>
								</li>
							);
						})}
					</ul>
				</nav>
			</div>
		);
	};

	const renderActiveModule = () => {
		switch (activeModule) {
			case 'student-directory':
				return <StudentDirectory students={students} setStudents={setStudents} filters={filters} setFilters={setFilters} />;
			case 'subject-manager':
				return <SubjectManager students={students} setStudents={setStudents} filters={filters} setFilters={setFilters} />;
			case 'syllabus-progress':
				return <SyllabusProgress students={students} filters={filters} setFilters={setFilters} />;
			case 'work-pool':
				return <WorkPoolComponent students={students} workPool={workPool} setWorkPool={setWorkPool} />;
			case 'doubt-box':
				return <DoubtBox students={students} doubts={doubts} setDoubts={setDoubts} />;
			default:
				return <SubjectManager students={students} setStudents={setStudents} filters={filters} setFilters={setFilters} />;
		}
	};

	return (
		<div className="flex min-h-screen bg-gray-50">
			<Navigation />
			<div className="flex-1 p-6">
				<div className="max-w-7xl mx-auto">
					{renderActiveModule()}
				</div>
			</div>
		</div>
	);
};

export default MentorDashboard;
