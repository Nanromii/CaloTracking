import json
import matplotlib.pyplot as plt
import numpy as np
from datetime import datetime, timedelta
import statistics

def load_all_health_data():
    """Load all health tracking data"""
    # Sample comprehensive health data
    weight_data = [
        {"id": "1", "date": "2024-01-01", "weight": 70.5},
        {"id": "2", "date": "2024-01-08", "weight": 70.2},
        {"id": "3", "date": "2024-01-15", "weight": 69.8},
        {"id": "4", "date": "2024-01-22", "weight": 69.5},
        {"id": "5", "date": "2024-01-29", "weight": 69.3},
    ]
    
    calorie_data = [
        {"date": "2024-01-01", "totalCalories": 1402, "carbs": 155, "protein": 75, "fat": 53},
        {"date": "2024-01-02", "totalCalories": 1382, "carbs": 143, "protein": 93, "fat": 50},
        {"date": "2024-01-03", "totalCalories": 1410, "carbs": 158, "protein": 82, "fat": 48},
        {"date": "2024-01-04", "totalCalories": 1395, "carbs": 150, "protein": 88, "fat": 52},
        {"date": "2024-01-05", "totalCalories": 1420, "carbs": 162, "protein": 78, "fat": 55},
    ]
    
    personal_info = {
        "age": 28,
        "gender": "male",
        "height": 175,
        "activity_level": "moderate",
        "bmr": 1680,
        "tdee": 2604
    }
    
    return weight_data, calorie_data, personal_info

def calculate_health_score(weight_data, calorie_data, personal_info):
    """Calculate overall health tracking score"""
    score = 0
    max_score = 100
    
    # Weight tracking consistency (25 points)
    if len(weight_data) >= 5:
        score += 25
    elif len(weight_data) >= 3:
        score += 15
    elif len(weight_data) >= 1:
        score += 5
    
    # Calorie tracking consistency (25 points)
    if len(calorie_data) >= 7:
        score += 25
    elif len(calorie_data) >= 5:
        score += 15
    elif len(calorie_data) >= 3:
        score += 10
    elif len(calorie_data) >= 1:
        score += 5
    
    # Calorie balance (25 points)
    if calorie_data and personal_info.get('tdee'):
        avg_calories = statistics.mean([day['totalCalories'] for day in calorie_data])
        tdee = personal_info['tdee']
        
        # Ideal range: within 200 calories of TDEE
        calorie_diff = abs(avg_calories - tdee)
        if calorie_diff <= 100:
            score += 25
        elif calorie_diff <= 200:
            score += 20
        elif calorie_diff <= 300:
            score += 15
        elif calorie_diff <= 500:
            score += 10
        else:
            score += 5
    
    # Macro balance (25 points)
    if calorie_data:
        total_carbs = sum([day['carbs'] for day in calorie_data])
        total_protein = sum([day['protein'] for day in calorie_data])
        total_fat = sum([day['fat'] for day in calorie_data])
        
        total_macro_calories = (total_carbs * 4) + (total_protein * 4) + (total_fat * 9)
        
        if total_macro_calories > 0:
            carb_pct = (total_carbs * 4) / total_macro_calories * 100
            protein_pct = (total_protein * 4) / total_macro_calories * 100
            fat_pct = (total_fat * 9) / total_macro_calories * 100
            
            # Ideal ranges: Carbs 45-65%, Protein 15-25%, Fat 20-35%
            carb_score = 10 if 45 <= carb_pct <= 65 else 5 if 35 <= carb_pct <= 75 else 0
            protein_score = 10 if 15 <= protein_pct <= 25 else 5 if 10 <= protein_pct <= 30 else 0
            fat_score = 5 if 20 <= fat_pct <= 35 else 2 if 15 <= fat_pct <= 40 else 0
            
            score += carb_score + protein_score + fat_score
    
    return min(score, max_score)

def generate_comprehensive_report(weight_data, calorie_data, personal_info):
    """Generate comprehensive health tracking report"""
    health_score = calculate_health_score(weight_data, calorie_data, personal_info)
    
    # Weight analysis
    weight_analysis = ""
    if len(weight_data) >= 2:
        current_weight = weight_data[-1]['weight']
        start_weight = weight_data[0]['weight']
        weight_change = current_weight - start_weight
        
        weight_analysis = f"""
📏 PHÂN TÍCH CÂN NẶNG:
• Cân nặng hiện tại: {current_weight} kg
• Thay đổi tổng: {weight_change:+.1f} kg
• Xu hướng: {'Giảm cân' if weight_change < 0 else 'Tăng cân' if weight_change > 0 else 'Ổn định'}
"""
    
    # Calorie analysis
    calorie_analysis = ""
    if calorie_data:
        avg_calories = statistics.mean([day['totalCalories'] for day in calorie_data])
        avg_carbs = statistics.mean([day['carbs'] for day in calorie_data])
        avg_protein = statistics.mean([day['protein'] for day in calorie_data])
        avg_fat = statistics.mean([day['fat'] for day in calorie_data])
        
        calorie_analysis = f"""
🍎 PHÂN TÍCH DINH DƯỠNG:
• Calo trung bình: {avg_calories:.0f} kcal/ngày
• Carbs trung bình: {avg_carbs:.0f}g/ngày
• Protein trung bình: {avg_protein:.0f}g/ngày
• Fat trung bình: {avg_fat:.0f}g/ngày
"""
    
    # BMR/TDEE analysis
    bmr_analysis = ""
    if personal_info.get('bmr') and personal_info.get('tdee'):
        bmr_analysis = f"""
⚡ PHÂN TÍCH NĂNG LƯỢNG:
• BMR (Trao đổi chất cơ bản): {personal_info['bmr']} kcal/ngày
• TDEE (Tổng năng lượng tiêu thụ): {personal_info['tdee']} kcal/ngày
• Mức độ hoạt động: {personal_info.get('activity_level', 'Chưa xác định')}
"""
    
    # Health score interpretation
    if health_score >= 80:
        score_interpretation = "Xuất sắc! Bạn đang theo dõi sức khỏe rất tốt."
    elif health_score >= 60:
        score_interpretation = "Tốt! Hãy tiếp tục duy trì thói quen theo dõi."
    elif health_score >= 40:
        score_interpretation = "Khá tốt, nhưng có thể cải thiện thêm."
    else:
        score_interpretation = "Cần cải thiện việc theo dõi sức khỏe."
    
    report = f"""
=== BÁO CÁO TỔNG HỢP SỨC KHỎE ===

🏆 ĐIỂM SỨC KHỎE TỔNG THỂ: {health_score}/100
{score_interpretation}

{weight_analysis}
{calorie_analysis}
{bmr_analysis}

📊 CHỈ SỐ THEO DÕI:
• Số ngày theo dõi cân nặng: {len(weight_data)}
• Số ngày theo dõi calo: {len(calorie_data)}
• Tính nhất quán: {'Tốt' if len(weight_data) >= 5 and len(calorie_data) >= 7 else 'Cần cải thiện'}

💡 KHUYẾN NGHỊ:
"""
    
    # Add recommendations
    if len(weight_data) < 5:
        report += "• Hãy theo dõi cân nặng thường xuyên hơn (ít nhất 2 lần/tuần)\n"
    
    if len(calorie_data) < 7:
        report += "• Ghi nhận calo hàng ngày để có dữ liệu chính xác hơn\n"
    
    if calorie_data and personal_info.get('tdee'):
        avg_calories = statistics.mean([day['totalCalories'] for day in calorie_data])
        if abs(avg_calories - personal_info['tdee']) > 300:
            report += f"• Điều chỉnh lượng calo gần với TDEE ({personal_info['tdee']} kcal) hơn\n"
    
    if health_score < 60:
        report += "• Tăng cường theo dõi đều đặn để cải thiện sức khỏe\n"
    
    report += "\n🎯 MỤC TIÊU TIẾP THEO:"
    report += "\n• Duy trì việc theo dõi hàng ngày"
    report += "\n• Cân bằng tốt hơn giữa các chất dinh dưỡng"
    report += "\n• Thiết lập mục tiêu sức khỏe cụ thể"
    
    return report

def create_dashboard_chart(weight_data, calorie_data, personal_info):
    """Create comprehensive health dashboard"""
    fig, ((ax1, ax2), (ax3, ax4)) = plt.subplots(2, 2, figsize=(16, 12))
    
    # 1. Weight trend
    if len(weight_data) >= 2:
        dates = [datetime.strptime(entry['date'], '%Y-%m-%d') for entry in weight_data]
        weights = [entry['weight'] for entry in weight_data]
        
        ax1.plot(dates, weights, 'o-', linewidth=3, markersize=8, color='#0891b2')
        ax1.set_title('Xu Hướng Cân Nặng', fontsize=16, fontweight='bold')
        ax1.set_ylabel('Cân nặng (kg)')
        ax1.grid(True, alpha=0.3)
    
    # 2. Daily calories vs TDEE
    if calorie_data:
        dates = [datetime.strptime(entry['date'], '%Y-%m-%d') for entry in calorie_data]
        calories = [entry['totalCalories'] for entry in calorie_data]
        
        ax2.bar(dates, calories, color='#f97316', alpha=0.7, label='Calo thực tế')
        if personal_info.get('tdee'):
            ax2.axhline(y=personal_info['tdee'], color='red', linestyle='--', 
                       linewidth=2, label=f'TDEE: {personal_info["tdee"]} kcal')
        ax2.set_title('Calo Hàng Ngày vs TDEE', fontsize=16, fontweight='bold')
        ax2.set_ylabel('Calo (kcal)')
        ax2.legend()
        ax2.tick_params(axis='x', rotation=45)
    
    # 3. Macro distribution
    if calorie_data:
        total_carbs = sum([day['carbs'] for day in calorie_data]) * 4
        total_protein = sum([day['protein'] for day in calorie_data]) * 4
        total_fat = sum([day['fat'] for day in calorie_data]) * 9
        
        macro_data = [total_carbs, total_protein, total_fat]
        macro_labels = ['Carbs', 'Protein', 'Fat']
        colors = ['#0891b2', '#f97316', '#d97706']
        
        ax3.pie(macro_data, labels=macro_labels, colors=colors, autopct='%1.1f%%', 
                startangle=90, textprops={'fontsize': 12})
        ax3.set_title('Phân Bổ Macro Tổng Thể', fontsize=16, fontweight='bold')
    
    # 4. Health score gauge
    health_score = calculate_health_score(weight_data, calorie_data, personal_info)
    
    # Create a simple gauge chart
    theta = np.linspace(0, np.pi, 100)
    r = np.ones_like(theta)
    
    ax4.plot(theta, r, 'k-', linewidth=8, alpha=0.3)
    
    # Color segments based on score ranges
    if health_score >= 80:
        color = 'green'
    elif health_score >= 60:
        color = 'orange'
    else:
        color = 'red'
    
    score_theta = np.linspace(0, np.pi * (health_score/100), 50)
    score_r = np.ones_like(score_theta)
    ax4.plot(score_theta, score_r, color=color, linewidth=8)
    
    ax4.set_ylim(0, 1.2)
    ax4.set_xlim(0, np.pi)
    ax4.set_title(f'Điểm Sức Khỏe: {health_score}/100', fontsize=16, fontweight='bold')
    ax4.text(np.pi/2, 0.5, f'{health_score}', ha='center', va='center', 
             fontsize=24, fontweight='bold', color=color)
    ax4.set_xticks([])
    ax4.set_yticks([])
    ax4.spines['top'].set_visible(False)
    ax4.spines['right'].set_visible(False)
    ax4.spines['bottom'].set_visible(False)
    ax4.spines['left'].set_visible(False)
    
    plt.tight_layout()
    plt.show()
    
    return fig

# Main execution
if __name__ == "__main__":
    print("🏥 BÁO CÁO TỔNG HỢP SỨC KHỎE")
    print("=" * 50)
    
    # Load all health data
    weight_data, calorie_data, personal_info = load_all_health_data()
    
    print(f"📊 Dữ liệu đã tải:")
    print(f"• {len(weight_data)} điểm dữ liệu cân nặng")
    print(f"• {len(calorie_data)} ngày dữ liệu calo")
    print(f"• Thông tin cá nhân: {personal_info.get('age')} tuổi, {personal_info.get('gender')}")
    
    # Calculate health score
    health_score = calculate_health_score(weight_data, calorie_data, personal_info)
    print(f"\n🏆 Điểm sức khỏe tổng thể: {health_score}/100")
    
    # Generate comprehensive report
    report = generate_comprehensive_report(weight_data, calorie_data, personal_info)
    print(report)
    
    # Create dashboard
    print("\n📈 Đang tạo dashboard tổng hợp...")
    create_dashboard_chart(weight_data, calorie_data, personal_info)
    
    print("\n✅ Hoàn thành báo cáo tổng hợp sức khỏe!")
