import {
  Button,
  Typography,
  Input,
  Stack,
  Sheet,
  CircularProgress,
} from '@mui/joy';
import { useEffect, useRef, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import {
  useFinalizeBDloginMutation,
  useGetUserByIdQuery,
  useVerifyOtpMutation,
} from '../../../redux/loginSlice';
import { toast } from 'react-toastify';

export function OtpVerification({ email, onSuccess }) {
  const [otpDigits, setOtpDigits] = useState(Array(6).fill(''));
  const [submitting, setSubmitting] = useState(false);
  const [userId, setUserId] = useState(null);
  const inputRefs = useRef([]);
  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from?.pathname || '/';

  console.log({email});

  const handleChange = (index, value) => {
    if (!/^\d?$/.test(value)) return;
    const updated = [...otpDigits];
    updated[index] = value;
    setOtpDigits(updated);
    if (value && index < 5) inputRefs.current[index + 1]?.focus();
    if (index === 5 && value) inputRefs.current[index]?.blur();
  };

  const handleKeyDown = (e, index) => {
    if (e.key === 'Backspace' && !otpDigits[index] && index > 0) {
      const updated = [...otpDigits];
      updated[index - 1] = '';
      setOtpDigits(updated);
      inputRefs.current[index - 1]?.focus();
    }
  };

  const getLocation = () =>
    new Promise((resolve, reject) => {
      if (!navigator.geolocation)
        return reject(new Error('Geolocation is not supported'));

      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const latitude = position.coords.latitude.toString();
          const longitude = position.coords.longitude.toString();
          let fullAddress = 'Unknown';

          try {
            const geoRes = await fetch(
              `https://nominatim.openstreetmap.org/reverse?lat=${latitude}&lon=${longitude}&format=json`
            );
            const data = await geoRes.json();
            fullAddress = data?.display_name || 'Unknown';
          } catch {}

          resolve({ latitude, longitude, fullAddress });
        },
        () => reject(new Error('Location access denied or unavailable'))
      );
    });

  const [verifyOtp] = useVerifyOtpMutation();
  const [finalizeBDlogin] = useFinalizeBDloginMutation();

  // ✅ Fetch user after userId is available
  const { data: userData } = useGetUserByIdQuery(userId, {
    skip: !userId,
  });

  // ✅ Effect to handle userData after fetch
  useEffect(() => {
    if (userData?.user) {
      localStorage.setItem('userDetails', JSON.stringify(userData.user));
      toast.success('Login Successful');
      navigate("/dashboard");
      if (onSuccess) onSuccess();
    }
  }, [userData]);

  const onSubmit = async () => {
    if (!email) return toast.error('Missing email. Please try again.');
    const otp = otpDigits.join('');
    if (otp.length !== 6)
      return toast.error('Please enter the complete 6-digit OTP.');

    try {
      setSubmitting(true);

      const { latitude, longitude, fullAddress } = await getLocation();
      await verifyOtp({ email, otp });

      const finalRes = await finalizeBDlogin({
        email,
        latitude,
        longitude,
        fullAddress,
      });
      
      console.log({finalRes});

      if (!finalRes?.data?.token || !finalRes?.data?.userId) {
        throw new Error('Missing token or userId from finalize login');
      }

      localStorage.setItem('authToken', finalRes?.data?.token);
      localStorage.setItem('userId', finalRes?.data?.userId);
      const expiration = new Date().getTime() + 3 * 24 * 60 * 60 * 1000;
      localStorage.setItem("authTokenExpiration", expiration.toString());
      setUserId(finalRes?.data?.userId); 
    } catch (err) {
      const message =
        err?.response?.data?.message ||
        err?.message ||
        'OTP verification failed';
      toast.error(message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Sheet
      component="form"
      onSubmit={(e) => {
        e.preventDefault();
        onSubmit();
      }}
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: 3,
        p: 2,
      }}
    >
      <Typography level="h4" textAlign="center">
        Verify OTP
      </Typography>
      <Typography level="body-sm" textAlign="center" color="neutral">
        Enter the OTP sent to IT Team
      </Typography>

      <Stack direction="row" spacing={1}>
        {otpDigits.map((digit, index) => (
          <Input
            key={index}
            value={digit}
            onChange={(e) => handleChange(index, e.target.value)}
            onKeyDown={(e) => handleKeyDown(e, index)}
            inputRef={(el) => el && (inputRefs.current[index] = el)}
            sx={{
              width: 40,
              height: 40,
              textAlign: 'center',
              fontWeight: 'bold',
              fontSize: '1.25rem',
            }}
            maxLength={1}
          />
        ))}
      </Stack>

      <Button
        type="submit"
        loading={submitting}
        sx={{ width: 160 }}
        color="primary"
        variant="solid"
      >
        {submitting ? <CircularProgress size="sm" /> : 'Verify OTP'}
      </Button>
    </Sheet>
  );
}
