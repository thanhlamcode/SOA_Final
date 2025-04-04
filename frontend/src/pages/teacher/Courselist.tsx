// components/CourseList.tsx
import { useState } from 'react';
import { useCourses } from '../../hooks/useCourses';
import EditCourseForm from './components/EditCourseForm';
import { updateCourse, createCourse, deleteCourse } from '@/api/teacher';  // Import thêm createCourse
import { Edit, Trash, Plus } from 'lucide-react'; // Import các icon từ lucide-react
import { Link } from 'react-router-dom';
import Layout from '@/components/layouts';
import { useAuthStore } from '@/stores/auth-store';

const CourseList = () => {

  const { _ui } = useAuthStore();

  const teacherId = _ui?.userId ?? 0;
  const { courses, loading, error, setCourses } = useCourses(teacherId);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedCourse, setSelectedCourse] = useState<any>(null);
  const [validationErrors, setValidationErrors] = useState<any>({}); // Lưu trữ lỗi validation

  // Hàm xử lý khi click vào nút chỉnh sửa
  const handleEditClick = (course: any) => {
    setSelectedCourse(course);
    setIsModalOpen(true);
  };

  // Hàm xử lý khi click vào nút xóa
  // Hàm xử lý khi click vào nút xóa
  const handleDeleteClick = async (courseId: number) => {
    try {
      // Gọi API xóa khóa học
      await deleteCourse(courseId);

      // Cập nhật lại danh sách khóa học trong state sau khi xóa thành công
      setCourses((prevCourses) => prevCourses.filter(course => course.id !== courseId));

      console.log('Course deleted successfully');
    } catch (error: any) {
      console.error('Failed to delete course:', error.message);
    }
  };


  // Hàm xử lý khi lưu dữ liệu khóa học sau khi chỉnh sửa
  const handleSave = async (id: number, updatedData: any) => {
    console.log('Saving course:', id, updatedData);

    const courseData = {
      id: id,
      name: updatedData.name,
      description: updatedData.description,
      schedule: updatedData.schedule,
      teacherId,
      studentIds: updatedData.studentIds || [],  // Lấy studentIds từ form nếu có
      createdAt: new Date().toISOString(),  // Giả sử thời gian tạo là thời gian hiện tại
    };

    try {
      const response = await updateCourse(id, courseData);
      console.log('Course updated successfully:', response);

      setCourses((prevCourses) =>
        prevCourses.map(course =>
          course.id === id ? { ...course, ...updatedData } : course
        )
      );
      setIsModalOpen(false);
    } catch (error: any) {
      console.error('Failed to update course:', error.message);
    }
  };

  // Hàm xử lý khi tạo khóa học mới
  const handleCreateCourse = async (_id: number, courseData: any) => {
    // Kiểm tra nếu các trường bắt buộc có giá trị
    const errors: any = {};
    if (!courseData.name) {
      errors.Name = 'The Name field is required.';
    }
    if (!courseData.schedule) {
      errors.Schedule = 'The Schedule field is required.';
    }
    if (!courseData.description) {
      errors.Description = 'The Description field is required.';
    }

    if (Object.keys(errors).length > 0) {
      setValidationErrors(errors);  // Lưu lỗi vào state
      return;  // Dừng lại nếu có lỗi
    }

    try {
      const coursePayload = {
        id: 0,  // id = 0 khi tạo mới
        name: courseData.name,
        description: courseData.description,
        schedule: courseData.schedule,
        teacherId,  // Giả sử teacherId là 2
        studentIds: courseData.studentIds || [],  // Lấy studentIds từ form nếu có
        createdAt: new Date().toISOString(),  // Thời gian tạo là thời gian hiện tại
      };

      const response = await createCourse(coursePayload);  // Gọi API để tạo khóa học mới
      setCourses((prevCourses) => [...prevCourses, response]);
      setIsModalOpen(false);
    } catch (error: any) {
      console.error('Failed to create course:', error.message);
    }
  };

  if (loading) return <div>Loading...</div>;
  if (error) return <div>{error}</div>;

  return (

    <Layout>
      <div className="container mx-auto p-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-semibold">Các Khóa học đang dạy</h2>

          {/* Nút tạo khóa học */}
          <button
            onClick={() => {
              setSelectedCourse(null);  // Xóa dữ liệu khóa học đã chọn khi tạo mới
              setIsModalOpen(true);  // Mở modal để tạo khóa học mới
            }}
            className="flex items-center bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
          >
            <Plus size={16} /> {/* Icon thêm */}
            Tạo khóa học
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {courses.map((course) => (
            <div
              key={course.id}
              className="bg-white p-4 border rounded-lg shadow-md hover:shadow-lg transition-shadow duration-300"
            >
              <Link to={`/teacher/courses/${course.id}`} className="block">
                <h3 className="text-xl font-semibold text-gray-900 mb-2">{course.name}</h3>
                <p className="text-gray-700 mb-2">{course.description}</p>
                <p className="text-gray-500 mb-3">Lịch học: {course.schedule}</p>
              </Link>
              <div className="flex gap-2">
                <button
                  onClick={() => handleEditClick(course)} // Truyền đối tượng course đầy đủ
                  className="text-sm px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700 flex items-center gap-2"
                >
                  <Edit size={16} /> {/* Icon chỉnh sửa */}
                  Chỉnh sửa
                </button>
                <button
                  onClick={() => handleDeleteClick(course.id)} // Truyền course.id khi xóa
                  className="text-sm px-3 py-1 bg-red-600 text-white rounded hover:bg-red-700 flex items-center gap-2"
                >
                  <Trash size={16} /> {/* Icon xóa */}
                  Xóa
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Modal tạo hoặc chỉnh sửa lớp học */}
        {isModalOpen && (
          <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
            <div className="bg-white p-6 rounded-xl shadow-lg w-full max-w-md relative">
              <button
                className="absolute top-2 right-3 text-gray-500 hover:text-gray-800 text-lg"
                onClick={() => setIsModalOpen(false)}  // Đóng modal khi click vào nút "✕"
              >
                ✕
              </button>
              <h3 className="text-xl font-bold mb-4">{selectedCourse ? 'Chỉnh sửa lớp học' : 'Tạo khóa học mới'}</h3>

              {/* Sử dụng EditCourseForm */}
              <EditCourseForm
                course={selectedCourse}  // Nếu có khóa học đã chọn, truyền vào để chỉnh sửa
                onSave={selectedCourse ? handleSave : handleCreateCourse}  // Sử dụng handleSave nếu có khóa học đã chọn, nếu không sử dụng handleCreateCourse
                onClose={() => setIsModalOpen(false)}  // Đóng modal khi đóng form
              />
            </div>
          </div>
        )}
      </div>
    </Layout>

  );
};

export default CourseList;
