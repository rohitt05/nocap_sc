import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Dimensions } from 'react-native';
import MemoryContainer from './MemoryCard';
import { useFetchArchives } from '../../../../API/fetchArchives';

const MemoryLaneTab = () => {
    const [selectedDate, setSelectedDate] = useState(new Date());
    const [currentMonth, setCurrentMonth] = useState(new Date());
    const today = new Date();

    // Use our custom hook to fetch archives
    const { loading, error, hasMemoriesForDate, getMemoriesForDate } = useFetchArchives();

    // Format date for display
    const formatDate = (date) => {
        const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
        return `${months[date.getMonth()]} ${date.getDate()}, ${date.getFullYear()}`;
    };

    // Format month for calendar header
    const formatMonth = (date) => {
        const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
        return `${months[date.getMonth()]} ${date.getFullYear()}`;
    };

    // Check if two dates are the same day
    const isSameDay = (date1, date2) => {
        return date1 && date2 &&
            typeof date1.getDate === 'function' &&
            typeof date2.getDate === 'function' &&
            date1.getDate() === date2.getDate() &&
            date1.getMonth() === date2.getMonth() &&
            date1.getFullYear() === date2.getFullYear();
    };

    // Check if two dates are the same month
    const isSameMonth = (date1, date2) => {
        return date1 && date2 &&
            typeof date1.getMonth === 'function' &&
            typeof date2.getMonth === 'function' &&
            date1.getMonth() === date2.getMonth() &&
            date1.getFullYear() === date2.getFullYear();
    };

    // Get days in a month
    const getDaysInMonth = (year, month) => {
        return new Date(year, month + 1, 0).getDate();
    };

    // Get day of week for first day of month (0 = Sunday)
    const getFirstDayOfMonth = (year, month) => {
        return new Date(year, month, 1).getDay();
    };

    // Navigate to previous month
    const goToPreviousMonth = () => {
        const newMonth = new Date(currentMonth);
        newMonth.setMonth(newMonth.getMonth() - 1);
        setCurrentMonth(newMonth);
    };

    // Navigate to next month
    const goToNextMonth = () => {
        const newMonth = new Date(currentMonth);
        newMonth.setMonth(newMonth.getMonth() + 1);

        // Only allow navigation to next month if it doesn't exceed the current month
        if (newMonth.getFullYear() <= today.getFullYear() &&
            newMonth.getMonth() <= today.getMonth()) {
            setCurrentMonth(newMonth);
        }
    };

    // Check if we're viewing the current month
    const isCurrentMonth = isSameMonth(currentMonth, today);

    // Render calendar grid
    const renderCalendar = () => {
        const year = currentMonth.getFullYear();
        const month = currentMonth.getMonth();

        const daysInMonth = getDaysInMonth(year, month);
        const firstDayOfMonth = getFirstDayOfMonth(year, month);

        // Day names row
        const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

        // Calculate days to display
        const days = [];

        // Add empty cells for days before the first day of month
        for (let i = 0; i < firstDayOfMonth; i++) {
            days.push(null);
        }

        // Add days of the month
        for (let i = 1; i <= daysInMonth; i++) {
            const dayDate = new Date(year, month, i);

            // If we're in current month, only add days up to today
            if (isCurrentMonth && i > today.getDate()) {
                days.push('future');
            } else {
                days.push(dayDate);
            }
        }

        // Create calendar grid
        const rows = [];
        let cells = [];

        // Add day name headers
        const dayNamesRow = (
            <View style={styles.calendarRow} key="dayNames">
                {dayNames.map(day => (
                    <View style={styles.dayNameCell} key={day}>
                        <Text style={styles.dayNameText}>{day}</Text>
                    </View>
                ))}
            </View>
        );
        rows.push(dayNamesRow);

        // Add calendar cells
        days.forEach((day, index) => {
            if (index % 7 === 0 && index > 0) {
                rows.push(
                    <View style={styles.calendarRow} key={index / 7}>
                        {cells}
                    </View>
                );
                cells = [];
            }

            const isToday = day && typeof day !== 'string' && isSameDay(day, today);
            const isSelected = day && typeof day !== 'string' && isSameDay(day, selectedDate);
            // Use the actual data to check if date has memories
            const hasMemoryForDate = day && typeof day !== 'string' && hasMemoriesForDate(day);
            const isFutureDate = day === 'future';

            cells.push(
                <TouchableOpacity
                    key={index}
                    style={[
                        styles.calendarCell,
                        isToday && styles.todayCell,
                        isSelected && styles.selectedCell,
                        (!day || isFutureDate) && styles.emptyCell,
                    ]}
                    onPress={() => day && typeof day !== 'string' && setSelectedDate(day)}
                    disabled={!day || typeof day === 'string'}
                >
                    {day && typeof day !== 'string' ? (
                        <View style={styles.dateContainer}>
                            <Text style={[
                                styles.dateText,
                                isToday && styles.todayText,
                                isSelected && styles.selectedText
                            ]}>
                                {day.getDate()}
                            </Text>
                            {hasMemoryForDate && (
                                <View style={[
                                    styles.memoryDot,
                                    isSelected && styles.selectedMemoryDot
                                ]} />
                            )}
                        </View>
                    ) : isFutureDate ? (
                        <Text style={styles.disabledDateText}>{index - firstDayOfMonth + 1}</Text>
                    ) : null}
                </TouchableOpacity>
            );
        });

        // Add remaining cells
        if (cells.length > 0) {
            rows.push(
                <View style={styles.calendarRow} key="lastRow">
                    {cells}
                </View>
            );
        }

        return rows;
    };

    // Get memories for selected date
    const selectedDateMemories = getMemoriesForDate(selectedDate);

    return (
        <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
            <Text style={styles.title}>Memory Lane</Text>
            <Text style={styles.subtitle}>Browse through your memories</Text>

            {error && (
                <View style={styles.errorContainer}>
                    <Text style={styles.errorText}>{error}</Text>
                </View>
            )}

            {/* Full Calendar View */}
            <View style={styles.calendarContainer}>
                {/* Month Navigation */}
                <View style={styles.monthNavigation}>
                    <TouchableOpacity onPress={goToPreviousMonth} style={styles.navButton}>
                        <Text style={styles.navButtonText}>←</Text>
                    </TouchableOpacity>
                    <Text style={styles.monthYearText}>{formatMonth(currentMonth)}</Text>
                    <TouchableOpacity
                        onPress={goToNextMonth}
                        style={[styles.navButton, isCurrentMonth && styles.disabledNavButton]}
                        disabled={isCurrentMonth}
                    >
                        <Text style={[styles.navButtonText, isCurrentMonth && styles.disabledNavText]}>→</Text>
                    </TouchableOpacity>
                </View>

                {/* Calendar Grid */}
                <View style={styles.calendarGrid}>
                    {renderCalendar()}
                </View>
            </View>

            {/* Using the enhanced MemoryContainer component */}
            <MemoryContainer
                selectedDate={selectedDate}
                formatDate={formatDate}
                memories={selectedDateMemories}
                loading={loading}
            />
        </ScrollView>
    );
};

const { width } = Dimensions.get('window');
const cellSize = width / 7 - 8; // 7 days per week with some padding

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#000',
    },
    contentContainer: {
        padding: 16,
        paddingBottom: 40, // Extra padding at bottom for better scrolling
    },
    title: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#fff',
        marginBottom: 8,
    },
    subtitle: {
        fontSize: 14,
        color: '#999',
        marginBottom: 24,
    },
    calendarContainer: {
        backgroundColor: '#111',
        borderRadius: 25,
        padding: 12,
        marginBottom: 50,
    },
    monthNavigation: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 15,
    },
    navButton: {
        padding: 8,
    },
    disabledNavButton: {
        opacity: 0.3,
    },
    navButtonText: {
        color: '#fff',
        fontSize: 18,
        fontWeight: 'bold',
    },
    disabledNavText: {
        color: '#666',
    },
    monthYearText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: 'bold',
    },
    calendarGrid: {
        marginBottom: 10,
    },
    calendarRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 8,
    },
    dayNameCell: {
        width: cellSize,
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 8,
    },
    dayNameText: {
        color: '#999',
        fontSize: 14,
    },
    calendarCell: {
        width: cellSize,
        height: cellSize,
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: 8,
    },
    dateContainer: {
        alignItems: 'center',
    },
    dateText: {
        color: '#fff',
        fontSize: 16,
    },
    disabledDateText: {
        color: '#333', // Very dark gray, almost invisible
        fontSize: 16,
    },
    emptyCell: {
        backgroundColor: 'transparent',
    },
    todayCell: {
        backgroundColor: '#222',
    },
    selectedCell: {
        backgroundColor: '#fff',
        borderRadius: 25,
    },
    todayText: {
        fontWeight: 'bold',
    },
    selectedText: {
        color: '#000',
        fontWeight: 'bold',
    },
    memoryDot: {
        width: 6,
        height: 6,
        borderRadius: 3,
        backgroundColor: '#fff',
        marginTop: 4,
    },
    selectedMemoryDot: {
        backgroundColor: '#000',
    },
    errorContainer: {
        flex: 1,
    },
    errorText: {
        fontSize: 18,
        color: 'red',
    }
});

export default MemoryLaneTab;