import { useState, type FormEvent } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import Navbar from '../components/Navbar';
import styles from './ProfilePage.module.css';

export default function ProfilePage() {
  const { user, updateUser } = useAuth();
  const [name, setName] = useState(user?.name || '');
  const [email, setEmail] = useState(user?.email || '');
  const [profileMsg, setProfileMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [profileLoading, setProfileLoading] = useState(false);

  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [pwMsg, setPwMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [pwLoading, setPwLoading] = useState(false);

  const handleProfile = async (e: FormEvent) => {
    e.preventDefault();
    setProfileLoading(true);
    setProfileMsg(null);
    try {
      await updateUser({ name, email });
      setProfileMsg({ type: 'success', text: 'Profile updated successfully.' });
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message;
      setProfileMsg({ type: 'error', text: msg || 'Update failed.' });
    } finally {
      setProfileLoading(false);
    }
  };

  const handlePassword = async (e: FormEvent) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      setPwMsg({ type: 'error', text: 'Passwords do not match.' });
      return;
    }
    if (newPassword.length < 6) {
      setPwMsg({ type: 'error', text: 'Password must be at least 6 characters.' });
      return;
    }
    setPwLoading(true);
    setPwMsg(null);
    try {
      await updateUser({ currentPassword, newPassword });
      setPwMsg({ type: 'success', text: 'Password changed successfully.' });
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message;
      setPwMsg({ type: 'error', text: msg || 'Failed to change password.' });
    } finally {
      setPwLoading(false);
    }
  };

  return (
    <div className={styles.page}>
      <Navbar />
      <div className={styles.content}>
        <div className={styles.pageHeader}>
          <Link to="/" className={styles.back}>← Back to Tasks</Link>
          <h1 className={styles.title}>Account Settings</h1>
        </div>

        <div className={styles.card}>
          <h2 className={styles.sectionTitle}>Profile Info</h2>
          {profileMsg && (
            <div className={`${styles.msg} ${profileMsg.type === 'error' ? styles.error : styles.success}`}>
              {profileMsg.text}
            </div>
          )}
          <form className={styles.form} onSubmit={handleProfile}>
            <div className={styles.field}>
              <label className={styles.label}>Name</label>
              <input
                className={styles.input}
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>
            <div className={styles.field}>
              <label className={styles.label}>Email</label>
              <input
                className={styles.input}
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <button className={styles.btn} type="submit" disabled={profileLoading}>
              {profileLoading ? 'Saving…' : 'Save changes'}
            </button>
          </form>
        </div>

        <div className={styles.card}>
          <h2 className={styles.sectionTitle}>Change Password</h2>
          {pwMsg && (
            <div className={`${styles.msg} ${pwMsg.type === 'error' ? styles.error : styles.success}`}>
              {pwMsg.text}
            </div>
          )}
          <form className={styles.form} onSubmit={handlePassword}>
            <div className={styles.field}>
              <label className={styles.label}>Current password</label>
              <input
                className={styles.input}
                type="password"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                required
              />
            </div>
            <div className={styles.field}>
              <label className={styles.label}>New password</label>
              <input
                className={styles.input}
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                required
                minLength={6}
              />
            </div>
            <div className={styles.field}>
              <label className={styles.label}>Confirm new password</label>
              <input
                className={styles.input}
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                minLength={6}
              />
            </div>
            <button className={styles.btn} type="submit" disabled={pwLoading}>
              {pwLoading ? 'Changing…' : 'Change password'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
