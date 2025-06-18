import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';

export interface Topic {
  code: number;
  name: string;
  description?: string;
  isActive: boolean;
}

@Injectable({
  providedIn: 'root'
})
export class TopicService {

  private topics: Topic[] = [
    { code: 1, name: 'Java', description: 'Java Programming Language', isActive: true },
    { code: 2, name: 'Spring', description: 'Spring Framework', isActive: true },
    { code: 3, name: 'Angular', description: 'Angular Framework', isActive: true },
    { code: 4, name: 'Database', description: 'Database Management', isActive: true },
    { code: 5, name: 'Data Structures', description: 'Data Structures and Algorithms', isActive: true },
    { code: 6, name: 'Algorithms', description: 'Algorithm Design and Analysis', isActive: true },
    { code: 7, name: 'System Design', description: 'System Architecture and Design', isActive: true },
    { code: 8, name: 'Spring Boot', description: 'Spring Boot Framework', isActive: true },
    { code: 9, name: 'React', description: 'React JavaScript Library', isActive: true },
    { code: 10, name: 'Node.js', description: 'Node.js Runtime Environment', isActive: true }
  ];

  constructor() { }

  getAllTopics(): Observable<Topic[]> {
    return of(this.topics);
  }

  getActiveTopics(): Observable<Topic[]> {
    const activeTopics = this.topics.filter(topic => topic.isActive);
    return of(activeTopics);
  }

  getTopicById(code: number): Observable<Topic | undefined> {
    const topic = this.topics.find(t => t.code === code);
    return of(topic);
  }

  getTopicByName(name: string): Observable<Topic | undefined> {
    const topic = this.topics.find(t => t.name.toLowerCase() === name.toLowerCase());
    return of(topic);
  }

  updateTopic(code: number, updates: Partial<Topic>): Observable<Topic | null> {
    const index = this.topics.findIndex(t => t.code === code);
    if (index !== -1) {
      this.topics[index] = { ...this.topics[index], ...updates };
      return of(this.topics[index]);
    }
    return of(null);
  }

  deleteTopic(code: number): Observable<boolean> {
    const index = this.topics.findIndex(t => t.code === code);
    if (index !== -1) {
      this.topics[index].isActive = false;
      return of(true);
    }
    return of(false);
  }

  permanentDeleteTopic(code: number): Observable<boolean> {
    const index = this.topics.findIndex(t => t.code === code);
    if (index !== -1) {
      this.topics.splice(index, 1);
      return of(true);
    }
    return of(false);
  }

  getTopicNames(): Observable<string[]> {
    const names = this.topics
      .filter(topic => topic.isActive)
      .map(topic => topic.name);
    return of(names);
  }

  searchTopics(searchTerm: string): Observable<Topic[]> {
    const filteredTopics = this.topics.filter(topic =>
      topic.isActive &&
      topic.name.toLowerCase().includes(searchTerm.toLowerCase())
    );
    return of(filteredTopics);
  }

  private getNextId(): number {
    return Math.max(...this.topics.map(t => t.code)) + 1;
  }
}