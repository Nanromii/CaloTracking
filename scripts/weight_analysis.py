import json
import matplotlib.pyplot as plt
import numpy as np
from datetime import datetime, timedelta
import statistics

def load_weight_data():
    """Load weight data from localStorage simulation"""
    # In a real scenario, this would read from localStorage
    # For demo purposes, we'll create sample data
    sample_data = [
        {"id": "1", "date": "2024-01-01", "weight": 70.5, "note": "Bắt đầu theo dõi"},
        {"id": "2", "date": "2024-01-08", "weight": 70.2, "note": "Tuần đầu"},
        {"id": "3", "date": "2024-01-15", "weight": 69.8, "note": "Giảm nhẹ"},
        {"id": "4", "date": "2024-01-22", "weight": 69.5, "note": "Tiếp tục giảm"},
        {"id": "5", "date": "2024-01-29", "weight": 69.3, "note": "Ổn định"},
        {"id": "6", "date": "2024-02-05", "weight": 69.0, "note": "Mục tiêu đạt được"},
    ]
    return sample_data

def analyze_weight_trend(weight_data):
    """Analyze weight trend and calculate statistics"""
    if len(weight_data) < 2:
        return {"error": "Cần ít nhất 2 điểm dữ liệu để phân tích"}
    
    weights = [entry["weight"] for entry in weight_data]
    dates = [datetime.strptime(entry["date"], "%Y-%m-%d") for entry in weight_data]
    
    # Calculate basic statistics
    current_weight = weights[-1]
    starting_weight = weights[0]
    total_change = current_weight - starting_weight
    
    # Calculate weekly average change
    total_days = (dates[-1] - dates[0]).days
    weekly_change = (total_change / total_days) * 7 if total_days > 0 else 0
    
    # Calculate trend (linear regression)
    x = np.array([(date - dates[0]).days for date in dates])
    y = np.array(weights)
    
    if len(x) > 1:
        slope, intercept = np.polyfit(x, y, 1)
        trend_direction = "giảm" if slope < 0 else "tăng" if slope > 0 else "ổn định"
    else:
        slope = 0
        trend_direction = "không đủ dữ liệu"
    
    # Calculate volatility (standard deviation)
    weight_changes = [weights[i] - weights[i-1] for i in range(1, len(weights))]
    volatility = statistics.stdev(weight_changes) if len(weight_changes) > 1 else 0
    
    analysis = {
        "current_weight": current_weight,
        "starting_weight": starting_weight,
        "total_change": round(total_change, 2),
        "weekly_change": round(weekly_change, 3),
        "trend_direction": trend_direction,
        "trend_slope": round(slope, 4),
        "volatility": round(volatility, 2),
        "total_days": total_days,
        "data_points": len(weight_data)
    }
    
    return analysis

def create_weight_chart(weight_data):
    """Create advanced weight tracking chart"""
    if len(weight_data) < 2:
        print("Cần ít nhất 2 điểm dữ liệu để vẽ biểu đồ")
        return
    
    weights = [entry["weight"] for entry in weight_data]
    dates = [datetime.strptime(entry["date"], "%Y-%m-%d") for entry in weight_data]
    
    # Create figure with subplots
    fig, (ax1, ax2) = plt.subplots(2, 1, figsize=(12, 10))
    
    # Main weight chart
    ax1.plot(dates, weights, 'o-', linewidth=2, markersize=6, color='#0891b2', label='Cân nặng')
    
    # Add trend line
    x_numeric = [(date - dates[0]).days for date in dates]
    if len(x_numeric) > 1:
        slope, intercept = np.polyfit(x_numeric, weights, 1)
        trend_line = [slope * x + intercept for x in x_numeric]
        ax1.plot(dates, trend_line, '--', color='#f97316', alpha=0.7, label='Xu hướng')
    
    ax1.set_title('Biểu Đồ Theo Dõi Cân Nặng', fontsize=16, fontweight='bold')
    ax1.set_xlabel('Ngày')
    ax1.set_ylabel('Cân nặng (kg)')
    ax1.grid(True, alpha=0.3)
    ax1.legend()
    
    # Weight change chart
    if len(weights) > 1:
        weight_changes = [weights[i] - weights[i-1] for i in range(1, len(weights))]
        change_dates = dates[1:]
        
        colors = ['green' if change <= 0 else 'red' for change in weight_changes]
        ax2.bar(change_dates, weight_changes, color=colors, alpha=0.7)
        ax2.axhline(y=0, color='black', linestyle='-', alpha=0.3)
        ax2.set_title('Thay Đổi Cân Nặng Giữa Các Lần Đo', fontsize=14)
        ax2.set_xlabel('Ngày')
        ax2.set_ylabel('Thay đổi (kg)')
        ax2.grid(True, alpha=0.3)
    
    plt.tight_layout()
    plt.show()
    
    return fig

def generate_weight_report(weight_data):
    """Generate comprehensive weight analysis report"""
    analysis = analyze_weight_trend(weight_data)
    
    if "error" in analysis:
        return analysis["error"]
    
    report = f"""
=== BÁO CÁO PHÂN TÍCH CÂN NẶNG ===

📊 THỐNG KÊ TỔNG QUAN:
• Cân nặng hiện tại: {analysis['current_weight']} kg
• Cân nặng ban đầu: {analysis['starting_weight']} kg
• Thay đổi tổng cộng: {analysis['total_change']:+.2f} kg
• Thời gian theo dõi: {analysis['total_days']} ngày
• Số lần đo: {analysis['data_points']} lần

📈 XU HƯỚNG:
• Hướng thay đổi: {analysis['trend_direction']}
• Tốc độ thay đổi: {analysis['weekly_change']:+.3f} kg/tuần
• Độ biến động: {analysis['volatility']:.2f} kg

💡 NHẬN XÉT:
"""
    
    # Add insights based on analysis
    if analysis['total_change'] < -2:
        report += "• Bạn đã giảm cân đáng kể. Hãy duy trì chế độ hiện tại!\n"
    elif analysis['total_change'] > 2:
        report += "• Cân nặng tăng nhiều. Cân nhắc điều chỉnh chế độ ăn và tập luyện.\n"
    else:
        report += "• Cân nặng khá ổn định. Tiếp tục duy trì thói quen tốt!\n"
    
    if analysis['volatility'] > 1:
        report += "• Cân nặng biến động nhiều. Hãy đo cân đều đặn vào cùng thời điểm.\n"
    else:
        report += "• Cân nặng ổn định, dữ liệu đáng tin cậy.\n"
    
    if abs(analysis['weekly_change']) > 0.5:
        report += "• Tốc độ thay đổi nhanh. Hãy đảm bảo thay đổi một cách an toàn.\n"
    
    return report

# Main execution
if __name__ == "__main__":
    print("🏃‍♂️ PHÂN TÍCH DỮ LIỆU CÂN NẶNG")
    print("=" * 50)
    
    # Load and analyze data
    weight_data = load_weight_data()
    print(f"Đã tải {len(weight_data)} điểm dữ liệu cân nặng")
    
    # Generate analysis
    analysis = analyze_weight_trend(weight_data)
    print("\n📊 KẾT QUẢ PHÂN TÍCH:")
    for key, value in analysis.items():
        print(f"• {key}: {value}")
    
    # Generate report
    report = generate_weight_report(weight_data)
    print(report)
    
    # Create visualization
    print("\n📈 Đang tạo biểu đồ...")
    create_weight_chart(weight_data)
    
    print("\n✅ Hoàn thành phân tích dữ liệu cân nặng!")
